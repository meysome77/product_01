import type { Metadata } from "next";

import { canManage, requireOrg } from "@/lib/auth/session";
import { env } from "@/lib/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}): Promise<Metadata> {
  const { orgSlug } = await params;
  const { organization } = await requireOrg(orgSlug);
  return { title: organization.name };
}

/** Phase 1 以降で実装する機能。順序は開発計画の Phase に対応 */
const UPCOMING = [
  {
    title: "会員名簿",
    body: "入会申込の承認と、保護者・お子さんの一覧管理",
    phase: "Phase 1",
  },
  {
    title: "予定と出欠",
    body: "練習・試合の日程登録と、保護者からの出欠回答の集計",
    phase: "Phase 2",
  },
  {
    title: "会費の集金",
    body: "月謝のカード自動引き落としと、未納の可視化",
    phase: "Phase 3",
  },
  {
    title: "お知らせ",
    body: "クラブ全体への連絡配信と既読の確認",
    phase: "Phase 4",
  },
];

export default async function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const { supabase, organization, role } = await requireOrg(orgSlug);

  const { count: memberCount } = await supabase
    .from("memberships")
    .select("id", { count: "exact", head: true })
    .eq("org_id", organization.id);

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>

      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border-subtle bg-surface p-5">
          <dt className="text-sm text-muted">運営メンバー</dt>
          <dd className="mt-1 text-2xl font-bold">{memberCount ?? 0}人</dd>
        </div>
        <div className="rounded-xl border border-border-subtle bg-surface p-5 sm:col-span-2">
          <dt className="text-sm text-muted">入会申込フォームのURL</dt>
          <dd className="mt-1 truncate font-mono text-sm">
            {env.siteUrl()}/join/{organization.slug}
          </dd>
          <p className="mt-2 text-xs text-muted">
            Phase 1 で有効になります。保護者に共有すると、ここから申込が届きます。
          </p>
        </div>
      </dl>

      {canManage(role) ? (
        <section className="mt-10">
          <h2 className="text-sm font-medium text-muted">これから使える機能</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {UPCOMING.map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-dashed border-border-subtle p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{item.title}</span>
                  <span className="shrink-0 text-xs text-muted">
                    {item.phase}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
