-- =============================================================
-- RLS 分離テスト
--
-- 「別のクラブのデータが一切見えないこと」を検証する。
-- マルチテナントの分離が破れると他クラブの子どもの個人情報が
-- 漏れるため、スキーマを変更したら必ずこれを通すこと。
--
-- 実行方法（ローカルの Supabase に対して）:
--   supabase db reset
--   psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '"')" \
--     -v ON_ERROR_STOP=1 -f supabase/tests/rls_isolation.sql
--
-- 全体をトランザクションで囲み最後に rollback するので、
-- 実行してもデータは残らない。
-- =============================================================

begin;

-- -------------------------------------------------------------
-- 検証ヘルパー
-- -------------------------------------------------------------
create or replace function pg_temp.assert(p_condition boolean, p_message text)
returns void
language plpgsql
as $$
begin
  if p_condition is not true then
    raise exception 'FAIL: %', p_message;
  end if;
  raise notice 'ok: %', p_message;
end;
$$;

-- 指定ユーザーとしてふるまう
create or replace function pg_temp.act_as(p_user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', p_user_id::text, 'role', 'authenticated')::text,
    true
  );
end;
$$;

create or replace function pg_temp.act_as_nobody()
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '', true);
end;
$$;

-- -------------------------------------------------------------
-- 準備: ユーザー A（クラブ甲の代表）と B（クラブ乙の代表）
-- -------------------------------------------------------------
\set user_a '11111111-1111-1111-1111-111111111111'
\set user_b '22222222-2222-2222-2222-222222222222'

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
)
values
  (:'user_a', '00000000-0000-0000-0000-000000000000', 'authenticated',
   'authenticated', 'a@example.test', '', now(), now(), now(),
   '{}'::jsonb, '{"display_name":"甲野代表"}'::jsonb),
  (:'user_b', '00000000-0000-0000-0000-000000000000', 'authenticated',
   'authenticated', 'b@example.test', '', now(), now(), now(),
   '{}'::jsonb, '{"display_name":"乙野代表"}'::jsonb);

-- handle_new_user トリガーが profiles を作ったか
select pg_temp.assert(
  (select count(*) from public.profiles where id in (:'user_a', :'user_b')) = 2,
  'サインアップ時に profiles が自動作成される'
);

select pg_temp.assert(
  (select display_name from public.profiles where id = :'user_a') = '甲野代表',
  'display_name が raw_user_meta_data から引き継がれる'
);

-- -------------------------------------------------------------
-- クラブ作成
-- -------------------------------------------------------------
select pg_temp.act_as(:'user_a');
select public.create_organization('kabu-fc', 'クラブ甲');

select pg_temp.act_as(:'user_b');
select public.create_organization('otsu-fc', 'クラブ乙');

-- 攻撃者は org_id を総当たりで知りうる前提で検証したいので、
-- RLS の外側で ID を控えておく。
reset role;
select set_config(
  'test.kabu_org_id',
  (select id::text from public.organizations where slug = 'kabu-fc'),
  true
);

-- 作成者が owner になっているか
select pg_temp.act_as(:'user_a');
select pg_temp.assert(
  (select role from public.memberships m
     join public.organizations o on o.id = m.org_id
    where o.slug = 'kabu-fc' and m.user_id = :'user_a') = 'owner',
  'クラブ作成者に owner ロールが付く'
);

-- -------------------------------------------------------------
-- 本題: 他クラブが見えないこと
-- -------------------------------------------------------------
select pg_temp.assert(
  (select count(*) from public.organizations) = 1,
  'A から見える organizations は自分のクラブ1件だけ'
);

select pg_temp.assert(
  (select count(*) from public.organizations where slug = 'otsu-fc') = 0,
  'A は B のクラブを select できない'
);

select pg_temp.assert(
  (select count(*) from public.memberships) = 1,
  'A から見える memberships は自クラブ分だけ'
);

select pg_temp.assert(
  (select count(*) from public.profiles where id = :'user_b') = 0,
  'A は同じクラブにいない B のプロフィールを見られない'
);

select pg_temp.act_as(:'user_b');
select pg_temp.assert(
  (select count(*) from public.organizations where slug = 'kabu-fc') = 0,
  'B は A のクラブを select できない'
);

-- -------------------------------------------------------------
-- 書き込みも塞がっていること
-- -------------------------------------------------------------
select pg_temp.act_as(:'user_b');

-- org_id を知っていても、B は A のクラブに自分をねじ込めないこと。
-- 権限エスカレーションの本丸なので、ID が漏れている前提で検証する。
do $$
begin
  insert into public.memberships (org_id, user_id, role)
  values (
    current_setting('test.kabu_org_id')::uuid,
    '22222222-2222-2222-2222-222222222222',
    'owner'
  );
  raise exception 'FAIL: B が A のクラブに所属を追加できてしまった';
exception
  when insufficient_privilege then
    raise notice 'ok: org_id を知っていても B は A のクラブに所属を追加できない';
end;
$$;

-- B が A のクラブ名を書き換えられないこと（update は 0 行になる）
do $$
declare
  v_updated int;
begin
  update public.organizations
     set name = '乗っ取り'
   where id = current_setting('test.kabu_org_id')::uuid;
  get diagnostics v_updated = row_count;

  if v_updated <> 0 then
    raise exception 'FAIL: B が A のクラブを更新できてしまった';
  end if;
  raise notice 'ok: B は A のクラブを更新できない';
end;
$$;

-- organizations への直接 insert は誰にも許可していないこと
do $$
begin
  insert into public.organizations (slug, name) values ('chokusetsu', '直接作成');
  raise exception 'FAIL: organizations に直接 insert できてしまった';
exception
  when insufficient_privilege then
    raise notice 'ok: organizations への直接 insert は塞がれている';
end;
$$;

-- -------------------------------------------------------------
-- 未ログインからは何も見えないこと
-- -------------------------------------------------------------
select pg_temp.act_as_nobody();

select pg_temp.assert(
  (select count(*) from public.organizations) = 0,
  '未ログインでは organizations が1件も見えない'
);

select pg_temp.assert(
  (select count(*) from public.profiles) = 0,
  '未ログインでは profiles が1件も見えない'
);

select pg_temp.assert(
  (select count(*) from public.memberships) = 0,
  '未ログインでは memberships が1件も見えない'
);

-- -------------------------------------------------------------
-- 予約 slug が弾かれること
-- -------------------------------------------------------------
reset role;
do $$
begin
  insert into public.organizations (slug, name) values ('login', '予約語クラブ');
  raise exception 'FAIL: 予約 slug が登録できてしまった';
exception
  when check_violation then
    raise notice 'ok: 予約 slug は check 制約で弾かれる';
end;
$$;

rollback;
