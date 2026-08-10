import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { FormError } from "@/components/ui/field";
import { safeRedirectPath } from "@/lib/forms";

export const metadata: Metadata = { title: "ログイン" };

const LINK_ERRORS: Record<string, string> = {
  invalid_link: "リンクが正しくありません。メール内のリンクをもう一度お試しください。",
  expired_link:
    "リンクの有効期限が切れています。お手数ですが、もう一度登録し直してください。",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const safeNext = safeRedirectPath(next, "");

  return (
    <>
      <h1 className="text-xl font-bold">ログイン</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        登録済みのメールアドレスでログインしてください。
      </p>

      {error && LINK_ERRORS[error] ? (
        <div className="mb-5">
          <FormError>{LINK_ERRORS[error]}</FormError>
        </div>
      ) : null}

      <LoginForm next={safeNext || undefined} />

      <p className="mt-6 text-sm text-muted">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="font-medium text-brand-600 underline">
          新規登録
        </Link>
      </p>
    </>
  );
}
