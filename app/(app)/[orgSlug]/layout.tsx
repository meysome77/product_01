import Link from "next/link";

import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { requireOrg } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/labels";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { organization, role } = await requireOrg(orgSlug);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border-subtle bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/${organization.slug}`}
              className="truncate font-bold tracking-tight"
            >
              {organization.name}
            </Link>
            <span className="shrink-0 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-800">
              {ROLE_LABELS[role]}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/orgs"
              className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              クラブ切替
            </Link>
            <form action={logout}>
              <Button type="submit" variant="ghost">
                ログアウト
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
