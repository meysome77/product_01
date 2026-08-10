"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import { env } from "@/lib/env";
import { safeRedirectPath, toFieldErrors, type FormState } from "@/lib/forms";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z
  .string()
  .trim()
  .min(1, "メールアドレスを入力してください")
  .email("メールアドレスの形式が正しくありません");

const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上にしてください")
  .max(72, "パスワードは72文字以内にしてください");

const signupSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "お名前を入力してください")
    .max(100, "お名前は100文字以内にしてください"),
  email: emailSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "パスワードを入力してください"),
});

export async function signup(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return toFieldErrors(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // profiles.display_name はこの値を使って DB トリガーが作成する
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${env.siteUrl()}/auth/confirm`,
    },
  });

  if (error) {
    // 既存アドレスかどうかを言い分けるとアカウントの存在を推測されるため、
    // 文面は区別せず一律にする。
    return {
      error:
        "登録できませんでした。入力内容を確認して、しばらくしてからもう一度お試しください。",
    };
  }

  return {
    message:
      "確認メールを送信しました。メール内のリンクを開くと登録が完了します。",
  };
}

export async function login(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return toFieldErrors(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "メールアドレスまたはパスワードが正しくありません。" };
  }

  const next = safeRedirectPath(formData.get("next")?.toString(), "/orgs");
  redirect(next as Route);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
