import type { Metadata } from "next";
import Link from "next/link";

import { logout } from "@/app/(auth)/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { FormError } from "@/components/ui/field";
import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/labels";

export const metadata: Metadata = { title: "クラブ一覧" };

export default async function OrgsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ supabase, user }, { error }] = await Promise.all([
    requireUser(),
    searchParams,
  ]);

  const { data } = await supabase
    .from("memberships")
    .select("role, organizations(slug, name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const memberships = (data ?? []).flatMap((row) =>
    row.organizations ? [{ role: row.role, org: row.organizations }] : [],
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">クラブ</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost">
            ログアウト
          </Button>
        </form>
      </header>

      {error === "not_found" ? (
        <div className="mb-6">
          <FormError>
            そのクラブは見つからないか、閲覧する権限がありません。
          </FormError>
        </div>
      ) : null}

      {memberships.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle p-10 text-center">
          <p className="font-medium">まだクラブに所属していません</p>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            クラブを新しく登録するか、代表者から届いた招待メールのリンクを開いてください。
          </p>
          <ButtonLink href="/orgs/new" className="mt-6">
            クラブを登録する
          </ButtonLink>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {memberships.map(({ role, org }) => (
              <li key={org.slug}>
                <Link
                  href={`/${org.slug}`}
                  className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface px-5 py-4 transition-colors hover:border-brand-300 hover:bg-brand-50"
                >
                  <span>
                    <span className="font-medium">{org.name}</span>
                    <span className="mt-0.5 block font-mono text-xs text-muted">
                      /{org.slug}
                    </span>
                  </span>
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-800">
                    {ROLE_LABELS[role]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <ButtonLink href="/orgs/new" variant="secondary" className="mt-6">
            別のクラブを登録する
          </ButtonLink>
        </>
      )}
    </div>
  );
}
