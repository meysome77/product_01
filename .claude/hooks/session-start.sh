#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code on the web environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# 依存関係が未インストールなら入れる。
# node_modules には Next.js の同梱ドキュメントも含まれており、
# これが無いと Next.js 16 の仕様を確認できない。
if [ ! -d node_modules ]; then
  npm install --no-audit --no-fund
fi
