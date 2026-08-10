import type { Metadata } from "next";
import Link from "next/link";

import { CreateOrgForm } from "@/components/orgs/create-org-form";
import { requireUser } from "@/lib/auth/session";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "クラブを登録" };

export default async function NewOrgPage() {
  await requireUser();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-12">
      <Link href="/orgs" className="mb-8 self-start text-sm text-muted">
        ← クラブ一覧へ戻る
      </Link>
      <div className="rounded-2xl border border-border-subtle bg-surface p-8">
        <h1 className="text-xl font-bold">クラブを登録</h1>
        <p className="mt-1 mb-6 text-sm leading-relaxed text-muted">
          登録するとあなたが代表者（owner）になります。あとから運営メンバーを追加できます。
        </p>
        <CreateOrgForm siteUrl={env.siteUrl()} />
      </div>
    </div>
  );
}
