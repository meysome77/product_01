"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { signup } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "登録しています…" : "アカウントを作成"}
    </Button>
  );
}

export function SignupForm() {
  const [state, formAction] = useActionState(signup, {});

  if (state.message) {
    return (
      <p className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm leading-relaxed text-brand-800">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormError>{state.error}</FormError>

      <Field
        label="お名前"
        name="displayName"
        hint="クラブの名簿に表示されます"
        errors={state.fieldErrors?.displayName}
      >
        <Input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          required
          invalid={Boolean(state.fieldErrors?.displayName)}
        />
      </Field>

      <Field label="メールアドレス" name="email" errors={state.fieldErrors?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          invalid={Boolean(state.fieldErrors?.email)}
        />
      </Field>

      <Field
        label="パスワード"
        name="password"
        hint="8文字以上"
        errors={state.fieldErrors?.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          invalid={Boolean(state.fieldErrors?.password)}
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
