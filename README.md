# クラブマネージャー

地域クラブ・スポーツ少年団のための運営支援サービス。
入会申込・会員名簿・出欠管理・会費のオンライン集金を1つにまとめます。

現状は **Phase 0（基盤）** まで実装済みです。

## 解こうとしている問題

少年団の運営は、名簿は Excel、入会は紙、連絡は LINE、出欠は LINE アンケート、
集金は現金か外部サービス、とバラバラに分かれています。その結果、
会計担当が毎月**入金一覧と名簿を手で突き合わせて未納者を探す**ことになります。

このサービスは入会から集金までを一本の線でつなぎ、その二重管理をなくします。

## 技術スタック

| 領域 | 採用 |
|---|---|
| フレームワーク | Next.js 16（App Router）+ TypeScript |
| DB / 認証 / ストレージ | Supabase（PostgreSQL + Auth + Storage） |
| スタイル | Tailwind CSS v4 |
| 決済 | Stripe Connect（direct charges）※ Phase 3 |
| メール | Resend ※ Phase 1 |

## セットアップ

```bash
npm install
cp .env.example .env.local   # Supabase の URL とキーを記入する
npm run dev
```

Supabase プロジェクトを作成したら、`supabase/migrations/` の SQL を
順番に適用してください。

## コマンド

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド（型チェックを含む）
npm run lint
npm run typecheck
npm run test:rls   # RLS 分離テスト
```

## RLS 分離テストについて

マルチテナントの分離が破れると、他クラブの子どもの個人情報が漏れます。
`npm run test:rls` は使い捨ての PostgreSQL を起動し、Supabase 相当の
`auth` スキーマを用意した上で、以下を検証します。

- 他クラブのデータが select できないこと
- org_id を知っていても、他クラブに自分をねじ込めないこと
- 未ログインでは何も見えないこと
- アプリのパスと衝突する予約 slug が弾かれること

**スキーマや RLS ポリシーを変更したら必ず実行してください。**

## ディレクトリ構成

```
app/
  (auth)/          ログイン・新規登録
  (app)/[orgSlug]/ クラブごとの画面
  orgs/            クラブ一覧・新規作成
  auth/confirm/    メール確認リンクの受け口
components/
lib/
  auth/            セッションと権限判定
  supabase/        クライアント生成と型
  domain/          純粋なドメインロジック（将来 Expo と共有する層）
supabase/
  migrations/      スキーマと RLS ポリシー
  tests/           RLS 分離テスト
proxy.ts           セッション更新と未ログインのリダイレクト
```

## 開発フェーズ

| Phase | 内容 | 状態 |
|---|---|---|
| 0 | 基盤（認証・クラブ・RLS） | 完了 |
| 1 | 会員管理（入会申込・承認・名簿） | 未着手 |
| 2 | スケジュールと出欠 | 未着手 |
| 3 | オンライン集金（Stripe Connect） | 未着手 |
| 4 | お知らせと PWA | 未着手 |
| 5 | 事業化整備 | 未着手 |
| 5.5 | 会計レポート | 未着手 |
| 6 | ネイティブアプリ（Expo） | 未着手 |
