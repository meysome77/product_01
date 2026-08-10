"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { createOrganization } from "@/app/orgs/actions";
import { Button } from "@/components/ui/button";
import { Field, FormError, Input } from "@/components/ui/field";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "作成しています…" : "クラブを作成"}
    </Button>
  );
}

export function CreateOrgForm({ siteUrl }: { siteUrl: string }) {
  const [state, formAction] = useActionState(createOrganization, {});
  const [slug, setSlug] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormError>{state.error}</FormError>

      <Field
        label="クラブ名"
        name="name"
        hint="保護者に表示される正式名称"
        errors={state.fieldErrors?.name}
      >
        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="みどり台サッカースポーツ少年団"
          invalid={Boolean(state.fieldErrors?.name)}
        />
      </Field>

      <Field
        label="URL"
        name="slug"
        hint={
          <>
            入会申込フォームのURLになります：
            <span className="font-mono">
              {siteUrl}/join/{slug || "midoridai-fc"}
            </span>
          </>
        }
        errors={state.fieldErrors?.slug}
      >
        <Input
          id="slug"
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(event) => setSlug(event.target.value.toLowerCase())}
          placeholder="midoridai-fc"
          className="font-mono"
          invalid={Boolean(state.fieldErrors?.slug)}
        />
      </Field>

      <SubmitButton />
    </form>
  );
}
