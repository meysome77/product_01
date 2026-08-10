-- =============================================================
-- 素の PostgreSQL で RLS テストを走らせるための最小ブートストラップ。
--
-- Supabase 本体が用意している auth スキーマ・ロール・権限のうち、
-- RLS の検証に必要な部分だけを再現する。これがあると Docker や
-- Supabase CLI なしでも分離テストを回せるので、CI でも使える。
--
-- 本番の Supabase では不要。ローカル検証専用。
-- =============================================================

-- Supabase の組み込みロール
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin noinherit bypassrls;
  end if;
end;
$$;

grant anon, authenticated, service_role to current_user;

create schema if not exists auth;
grant usage on schema auth to anon, authenticated, service_role;

-- auth.users は Supabase 本体の定義のうち、トリガーとテストが
-- 参照する列だけを持つ簡略版。
create table if not exists auth.users (
  id                  uuid primary key,
  instance_id         uuid,
  aud                 text,
  role                text,
  email               text unique,
  encrypted_password  text,
  email_confirmed_at  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  raw_app_meta_data   jsonb not null default '{}'::jsonb,
  raw_user_meta_data  jsonb not null default '{}'::jsonb
);

-- リクエストの JWT から現在のユーザー ID を取り出す。
-- Supabase 本体と同じ実装。
create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid;
$$;

-- Supabase のデフォルト権限に合わせる。
-- これを忘れると RLS ではなく権限不足で落ち、
-- 「RLS が効いている」と誤解する結果になる。
grant usage on schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
