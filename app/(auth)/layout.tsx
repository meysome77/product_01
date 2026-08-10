import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 self-start text-lg font-bold tracking-tight"
      >
        クラブマネージャー
      </Link>
      <div className="rounded-2xl border border-border-subtle bg-surface p-8">
        {children}
      </div>
    </div>
  );
}
