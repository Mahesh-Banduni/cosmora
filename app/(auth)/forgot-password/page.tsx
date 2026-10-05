"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { requestPasswordResetAction, type AuthState } from "@/app/actions/auth";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    requestPasswordResetAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-scale-md-6">
      <div className="flex flex-col gap-scale-sm-2">
        <h2 className="h4">Reset your password</h2>
        <p className="para-text-sm text-[var(--text-secondary)]">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {state?.error ? (
        <p
          role="alert"
          className="rounded-lg border border-[color-mix(in_srgb,var(--destructive)_28%,transparent)] bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] px-scale-sm-4 py-scale-sm-3 para-text-sm text-[var(--destructive)]"
        >
          {state.error}
        </p>
      ) : null}

      {state?.success ? (
        <p
          role="status"
          className="rounded-lg border border-[color-mix(in_srgb,var(--success)_28%,transparent)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] px-scale-sm-4 py-scale-sm-3 para-text-sm text-[var(--success)]"
        >
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-col gap-scale-sm-5">
        <div className="flex flex-col gap-scale-sm-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="w-full"
        >
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Send reset link
        </Button>
      </div>

      <Link
        href="/login"
        className="para-text-sm text-[var(--text-secondary)] underline-offset-2 hover:underline"
      >
        Back to sign in
      </Link>
    </form>
  );
}