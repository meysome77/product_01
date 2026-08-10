"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth/session";
import { toFieldErrors, type FormState } from "@/lib/forms";

/** DB の organizations_slug_not_reserved と必ず同じ内容に保つこと */
const RESERVED_SLUGS = new Set([
  "about", "account", "admin", "api", "app", "assets", "auth",
  "billing", "blog", "contact", "dashboard", "docs", "faq",
  "favicon", "help", "join", "legal", "login", "logout", "new",
  "orgs", "privacy", "public", "robots", "settings", "signup",
  "sitemap", "static", "stripe", "support", "terms", "webhooks",
]);

const createOrgSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "クラブ名を入力してください")
    .max(100, "クラブ名は100文字以内にしてください"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "URLは3文字以上にしてください")
    .max(32, "URLは32文字以内にしてください")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "半角英小文字・数字・ハイフンが使えます。先頭と末尾はハイフン以外にしてください",
    )
    .refine((value) => !RESERVED_SLUGS.has(value), {
      message: "このURLは予約されているため使用できません",
    }),
});

export async function createOrganization(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createOrgSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) return toFieldErrors(parsed.error);

  const { supabase } = await requireUser();

  // organizations への直接 insert は RLS で塞いである。
  // クラブ本体と owner の所属を同時に作るため、必ずこの関数を通す。
  const { data, error } = await supabase.rpc("create_organization", {
    p_slug: parsed.data.slug,
    p_name: parsed.data.name,
  });

  if (error) {
    // 23505 = unique_violation
    if (error.code === "23505") {
      return { fieldErrors: { slug: ["このURLはすでに使われています"] } };
    }
    return {
      error: "クラブを作成できませんでした。時間をおいてもう一度お試しください。",
    };
  }

  redirect(`/${data.slug}`);
}
