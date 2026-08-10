import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "新規登録" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-xl font-bold">アカウントを作成</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        クラブの登録も、招待されたクラブへの参加も、このアカウントで行えます。
      </p>

      <SignupForm />

      <p className="mt-6 text-sm text-muted">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="font-medium text-brand-600 underline">
          ログイン
        </Link>
      </p>
    </>
  );
}
