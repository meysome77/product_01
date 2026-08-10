<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# このプロジェクトについて

地域クラブ・スポーツ少年団向けの会員管理・集金サービス。
開発計画は Phase 0〜6 に分かれている。

## 絶対に守ること

**マルチテナントの分離**が最優先。全テーブルに `org_id` を持たせ、RLS で必ず絞る。
分離が破れると他クラブの子どもの個人情報が漏れる。

- 新しいテーブルを追加したら、必ず RLS を有効化してポリシーを書く
- 判定には `public.is_org_member()` / `public.can_manage_org()` を使う
- スキーマやポリシーを触ったら `npm run test:rls` を通す
- `SUPABASE_SERVICE_ROLE_KEY` をクライアント側のコードに持ち込まない

**決済の資金フロー**。Stripe Connect は direct charges のみを使う。
プラットフォームの残高に他人の資金を通すと、収納代行・資金移動業の
規制対象に近づく。destination charges と separate charges and transfers は選ばない。

## Next.js 16 での注意点

- `middleware.ts` は `proxy.ts` に改称された。エクスポート名も `proxy`
- `params` / `searchParams` / `cookies()` はすべて Promise。`await` が要る
- `typedRoutes` が有効。存在しないルートへの `Link` はビルドで落ちる。
  動的な文字列は `as Route` でキャストする

## Supabase の注意点

- `lib/supabase/types.ts` は手書き。各テーブルに `Relationships` が必須で、
  省くとテーブル型が `never` に落ち、select 結果が静かに壊れる
- 認可判断には `getUser()` を使う。`getSession()` は cookie を信用するだけで
  改竄を検出できない
- RLS ポリシーが `memberships` を参照する場合、無限再帰を避けるため
  SECURITY DEFINER 関数を経由する

## コマンド

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド（型チェックを含む）
npm run lint
npm run typecheck
npm run test:rls   # RLS 分離テスト（使い捨ての PostgreSQL を立てて実行）
```
