#!/usr/bin/env bash
#
# RLS 分離テストを実行する。
#
# 使い方:
#   ./scripts/test-rls.sh                 # 使い捨ての PostgreSQL を立てて実行
#   DATABASE_URL=postgres://... ./scripts/test-rls.sh
#
# マルチテナントの分離が破れると他クラブの子どもの個人情報が漏れるため、
# スキーマかポリシーを触ったら必ず通すこと。
set -euo pipefail

cd "$(dirname "$0")/.."

BOOTSTRAP="supabase/tests/_bootstrap_local.sql"
TESTS="supabase/tests/rls_isolation.sql"

if [[ -n "${DATABASE_URL:-}" ]]; then
  # 既存の DB を使う場合、マイグレーションは適用済みとみなす
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$TESTS"
  exit 0
fi

PGBIN="$(dirname "$(command -v pg_ctl || echo /usr/lib/postgresql/16/bin/pg_ctl)")"
if [[ ! -x "$PGBIN/initdb" ]]; then
  echo "PostgreSQL のバイナリが見つかりません。DATABASE_URL を指定してください。" >&2
  exit 1
fi

WORKDIR="$(mktemp -d)"
PORT="${PGPORT:-55432}"
# initdb は root で動かないため、root の場合だけ postgres ユーザーに落とす
RUN_AS=""
if [[ "$(id -u)" -eq 0 ]]; then
  RUN_AS="postgres"
  chown -R postgres:postgres "$WORKDIR"
fi

run() {
  if [[ -n "$RUN_AS" ]]; then
    su "$RUN_AS" -c "$1"
  else
    bash -c "$1"
  fi
}

cleanup() {
  run "$PGBIN/pg_ctl -D $WORKDIR/data stop -m immediate" >/dev/null 2>&1 || true
  rm -rf "$WORKDIR"
}
trap cleanup EXIT

mkdir -p "$WORKDIR/data" "$WORKDIR/sock"
[[ -n "$RUN_AS" ]] && chown -R postgres:postgres "$WORKDIR"

echo "使い捨ての PostgreSQL を起動します..."
run "$PGBIN/initdb -D $WORKDIR/data -U postgres --auth=trust" >/dev/null
run "$PGBIN/pg_ctl -D $WORKDIR/data -o '-p $PORT -k $WORKDIR/sock -c listen_addresses=' -l $WORKDIR/data/server.log start" >/dev/null

URL="postgresql://postgres@/postgres?host=$WORKDIR/sock&port=$PORT"

echo "Supabase 相当の auth スキーマを用意します..."
psql "$URL" -v ON_ERROR_STOP=1 -q -f "$BOOTSTRAP"

echo "マイグレーションを適用します..."
for migration in supabase/migrations/*.sql; do
  psql "$URL" -v ON_ERROR_STOP=1 -q -f "$migration"
done

echo "RLS 分離テストを実行します..."
# パイプで psql の終了コードが隠れないよう、いったんファイルに落とす
OUTPUT="$WORKDIR/result.log"
STATUS=0
psql "$URL" -v ON_ERROR_STOP=1 -q -f "$TESTS" >"$OUTPUT" 2>&1 || STATUS=$?

sed -E 's/^psql:[^:]+:[0-9]+: //' "$OUTPUT" | grep -E "^(NOTICE|ERROR|FAIL)" || true

if [[ $STATUS -ne 0 ]]; then
  echo "RLS テストが失敗しました" >&2
  exit 1
fi

echo "すべてのRLSテストが通りました"
