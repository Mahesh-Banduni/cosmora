"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { resetPasswordAction, type AuthState } from "@/app/actions/auth";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    resetPasswordAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-scale-md-6">
      <div className="flex flex-col gap-scale-sm-2">
        <h2 className="h4">Choose a new password</h2>
        <p className="para-text-sm text-[var(--text-secondary)]">
          Use at least 8 characters.
        </p>
      </div>

      <input type="hidden" name="token" value={token} />

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
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          className="w-full"
        >
          {isPending ? <Loader2 className="animate-spin" /> : null}
          Update password
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}