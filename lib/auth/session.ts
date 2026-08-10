import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Organization, OrgRole } from "@/lib/supabase/types";

/**
 * ログイン中のユーザーを取得する。未ログインならログインへ飛ばす。
 *
 * getUser() は Auth サーバーでトークンを検証する。cookie を信用するだけの
 * getSession() は改竄を検出できないため、認可判断には使わない。
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { supabase, user };
}

export type OrgContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  organization: Organization;
  role: OrgRole;
};

/**
 * slug からクラブを引き、所属していなければ 404 を返す。
 *
 * RLS により非所属のクラブは select 結果が空になるので、
 * 「存在しない」と「権限がない」が自然に同じ応答になる。
 * クラブの存在有無を外部に漏らさないためにも、ここは 403 ではなく 404。
 */
export async function requireOrg(slug: string): Promise<OrgContext> {
  const { supabase, user } = await requireUser();

  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!organization) redirect("/orgs?error=not_found");

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("org_id", organization.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) redirect("/orgs?error=not_found");

  return { supabase, organization, role: membership.role };
}

const MANAGER_ROLES: OrgRole[] = ["owner", "admin"];

export function canManage(role: OrgRole): boolean {
  return MANAGER_ROLES.includes(role);
}

/** 管理者向けページの入口で使う。権限がなければクラブトップへ戻す */
export async function requireManager(slug: string): Promise<OrgContext> {
  const context = await requireOrg(slug);
  if (!canManage(context.role)) redirect(`/${slug}`);
  return context;
}
