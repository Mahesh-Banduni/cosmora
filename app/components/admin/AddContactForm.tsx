"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";

import { createContactAction } from "@/app/actions/admin-leads";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";
import type { ActionResult } from "@/lib/action-result";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Plus className="size-4" />
      )}
      {pending ? "Adding…" : "Add contact"}
    </Button>
  );
}

function Field({
  id,
  label,
  ...inputProps
}: {
  id: string;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-scale-sm-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} {...inputProps} />
    </div>
  );
}

export default function AddContactForm({
  companyId,
}: {
  companyId: string;
}) {
  const [state, action] = useActionState<ActionResult<{ id: string }> | null, FormData>(
    createContactAction,
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      action={action}
      className="flex flex-col gap-scale-md-4 border-t border-[var(--border)] px-scale-md-4 py-scale-md-4"
    >
      <input type="hidden" name="companyId" value={companyId} />

      <div className="grid gap-scale-sm-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field id="firstName" label="First name" />
        <Field id="lastName" label="Last name" />
        <Field id="email" label="Email" type="email" required />
        <Field id="jobTitle" label="Job title" />
        <Field id="phone" label="Phone" />
        <Field id="linkedinUrl" label="LinkedIn URL" type="url" />
      </div>

      {state && !state.ok ? (
        <p role="alert" className="para-text-sm text-[var(--destructive)]">
          {state.error}
        </p>
      ) : null}

      {state?.ok ? (
        <p className="para-text-xs text-[var(--success)]">{state.message}</p>
      ) : null}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
