-- =============================================================
-- Phase 0: 組織・プロフィール・所属の基盤スキーマ
--
-- マルチテナントの単位は organizations（クラブ）。
-- 以降に追加する全テーブルは org_id を持ち、ここで定義する
-- ヘルパー関数を使って RLS で必ず絞ること。
-- =============================================================

-- -------------------------------------------------------------
-- 列挙型
-- -------------------------------------------------------------
create type public.org_role as enum (
  'owner',    -- クラブ代表。削除・決済設定を含む全権限
  'admin',    -- 運営担当。会員承認・予定作成・会費管理
  'coach',    -- 指導者。予定作成と出欠閲覧
  'guardian', -- 保護者。自分に紐づく会員の情報のみ
  'member'    -- 会員本人（中学生以上に付与する場合）
);

-- -------------------------------------------------------------
-- updated_at 自動更新
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -------------------------------------------------------------
-- テーブル
-- -------------------------------------------------------------
create table public.organizations (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique
              constraint organizations_slug_format
              check (slug ~ '^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$')
              -- クラブのURLは /{slug} なので、アプリ自身のパスと衝突する
              -- 名前を許すと、そのクラブに永久に到達できなくなる。
              constraint organizations_slug_not_reserved
              check (slug <> all (array[
                'about', 'account', 'admin', 'api', 'app', 'assets', 'auth',
                'billing', 'blog', 'contact', 'dashboard', 'docs', 'faq',
                'favicon', 'help', 'join', 'legal', 'login', 'logout', 'new',
                'orgs', 'privacy', 'public', 'robots', 'settings', 'signup',
                'sitemap', 'static', 'stripe', 'support', 'terms', 'webhooks'
              ])),
  name        text not null check (char_length(trim(name)) between 1 and 100),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.organizations is 'クラブ。マルチテナントの分離単位';
comment on column public.organizations.slug is 'URL に使う識別子。/join/[slug] で公開申込フォームに使用';

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 100),
  email        text,
  phone        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is 'ログインするユーザー。会員（members）とは別物である点に注意';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create table public.memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       public.org_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, user_id)
);

comment on table public.memberships is 'ユーザーとクラブの所属関係。RLS の判定はすべてこのテーブルを起点にする';

create index memberships_user_id_idx on public.memberships (user_id);
create index memberships_org_id_idx on public.memberships (org_id);

create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- RLS ヘルパー
--
-- memberships を参照するポリシーを memberships 自身に書くと
-- 無限再帰になるため、SECURITY DEFINER で RLS を迂回する。
-- search_path を空にして schema hijacking を防ぎ、
-- テーブル名はすべて完全修飾する。
-- -------------------------------------------------------------
create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = p_org_id
      and m.user_id = (select auth.uid())
  );
$$;

comment on function public.is_org_member is '呼び出し元が指定クラブに所属しているか';

create or replace function public.has_org_role(p_org_id uuid, p_roles public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = p_org_id
      and m.user_id = (select auth.uid())
      and m.role = any(p_roles)
  );
$$;

comment on function public.has_org_role is '呼び出し元が指定クラブで指定ロールのいずれかを持つか';

-- 管理権限（承認・予定作成・会費設定）の共通判定
create or replace function public.can_manage_org(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_org_role(p_org_id, array['owner', 'admin']::public.org_role[]);
$$;

-- -------------------------------------------------------------
-- RLS
-- -------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.profiles      enable row level security;
alter table public.memberships   enable row level security;

-- organizations --------------------------------------------------
-- 所属しているクラブのみ閲覧可。
-- 公開申込フォーム（/join/[slug]）はサーバー側で service role を使わず、
-- 別途 SECURITY DEFINER 関数で必要最小限の情報だけを返す（Phase 1 で追加）。
create policy "所属クラブを閲覧できる"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id));

create policy "owner と admin はクラブ情報を更新できる"
  on public.organizations for update
  to authenticated
  using (public.can_manage_org(id))
  with check (public.can_manage_org(id));

create policy "owner はクラブを削除できる"
  on public.organizations for delete
  to authenticated
  using (public.has_org_role(id, array['owner']::public.org_role[]));

-- クラブ作成は create_organization() 経由のみ。
-- 直接 insert させると owner の membership を作らないまま
-- 誰も触れないクラブが生まれるため、INSERT ポリシーは張らない。

-- profiles -------------------------------------------------------
create policy "自分のプロフィールを閲覧できる"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "同じクラブの人のプロフィールを閲覧できる"
  on public.profiles for select
  to authenticated
  using (
    exists (
      select 1
      from public.memberships mine
      join public.memberships theirs on theirs.org_id = mine.org_id
      where mine.user_id = (select auth.uid())
        and theirs.user_id = public.profiles.id
    )
  );

create policy "自分のプロフィールを更新できる"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- memberships ----------------------------------------------------
create policy "同じクラブの所属一覧を閲覧できる"
  on public.memberships for select
  to authenticated
  using (public.is_org_member(org_id));

create policy "owner と admin は所属を追加できる"
  on public.memberships for insert
  to authenticated
  with check (public.can_manage_org(org_id));

create policy "owner と admin は所属を更新できる"
  on public.memberships for update
  to authenticated
  using (public.can_manage_org(org_id))
  with check (public.can_manage_org(org_id));

create policy "owner と admin は所属を削除できる"
  on public.memberships for delete
  to authenticated
  using (public.can_manage_org(org_id));

-- -------------------------------------------------------------
-- サインアップ時に profiles を自動作成
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------
-- クラブ作成
--
-- organizations への insert と owner の memberships 作成を
-- 1 トランザクションで行う。どちらか片方だけ成功して
-- 「誰も管理できないクラブ」が残る事故を防ぐ。
-- -------------------------------------------------------------
create or replace function public.create_organization(p_slug text, p_name text)
returns public.organizations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_org public.organizations;
begin
  if v_user_id is null then
    raise exception 'ログインが必要です' using errcode = '42501';
  end if;

  insert into public.organizations (slug, name)
  values (lower(trim(p_slug)), trim(p_name))
  returning * into v_org;

  insert into public.memberships (org_id, user_id, role)
  values (v_org.id, v_user_id, 'owner');

  return v_org;
end;
$$;

comment on function public.create_organization is 'クラブと作成者の owner 所属を同時に作る。クラブ作成の唯一の入口';

revoke all on function public.create_organization(text, text) from public;
grant execute on function public.create_organization(text, text) to authenticated;
