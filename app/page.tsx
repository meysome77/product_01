import Link from "next/link";

const features = [
  {
    title: "入会手続きをオンラインで",
    body: "公開URLの申込フォームから保護者が申し込み、管理者が承認すると名簿に自動登録されます。紙の申込書と転記作業がなくなります。",
  },
  {
    title: "出欠をその場で集計",
    body: "練習や試合の予定を登録すると保護者に届き、回答がそのまま集計されます。LINEアンケートの手集計から解放されます。",
  },
  {
    title: "会費をカードで自動徴収",
    body: "月謝を毎月自動で引き落とし。誰が未納かは名簿にそのまま表示されるので、入金一覧との突き合わせが要りません。",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <span className="text-lg font-bold tracking-tight">
          クラブマネージャー
        </span>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 font-medium text-muted transition-colors hover:text-foreground"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white transition-colors hover:bg-brand-700"
          >
            無料ではじめる
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col justify-center py-16">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          名簿・出欠・会費を、
          <br />
          ひとつにまとめる。
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          地域クラブとスポーツ少年団のための運営支援サービスです。
          Excelの名簿、紙の申込書、LINEのアンケート、現金の月謝袋。
          バラバラだった運営をひとつの画面に集約します。
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition-colors hover:bg-brand-700"
          >
            クラブを登録する
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-border-subtle bg-surface px-6 py-3 font-medium transition-colors hover:bg-brand-50"
          >
            ログイン
          </Link>
        </div>

        <dl className="mt-20 grid gap-6 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border-subtle bg-surface p-6"
            >
              <dt className="font-bold">{feature.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">
                {feature.body}
              </dd>
            </div>
          ))}
        </dl>
      </main>

      <footer className="border-t border-border-subtle py-6 text-sm text-muted">
        © {new Date().getFullYear()} クラブマネージャー
      </footer>
    </div>
  );
}
