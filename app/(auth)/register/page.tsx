"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { registerAction, type AuthState } from "@/app/actions/auth";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    registerAction,
    null
  );

  const credentialsRef = useRef({ email: "", password: "" });
    const navigatedRef = useRef(false);

  useEffect(() => {
      if (!state?.destination || navigatedRef.current) return;

      navigatedRef.current = true;

    signIn("credentials", {
      ...credentialsRef.current,
      callbackUrl: state.destination,
      redirect: false,
    })
      .then(() => {
        router.push(state.destination!);
        router.refresh();
      })
        .catch(() => {
          navigatedRef.current = false;
        });
    }, [state, router]);

    const isRedirecting = Boolean(state?.destination);

  function captureCredentials(form: HTMLFormElement) {
    const data = new FormData(form);
    credentialsRef.current = {
      email: String(data.get("email") ?? "").trim().toLowerCase(),
      password: String(data.get("password") ?? ""),
    };
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => captureCredentials(event.currentTarget)}
      className="flex flex-col gap-scale-md-6"
    >
      <div className="flex flex-col gap-scale-sm-2">
        <h2 className="h4">Create your workspace</h2>
        <p className="para-text-sm text-[var(--text-secondary)]">
          Start matching leads and running campaigns in minutes.
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

      <div className="flex flex-col gap-scale-sm-5">
        <div className="flex flex-col gap-scale-sm-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required placeholder="Alex Morgan" />
        </div>

        <div className="flex flex-col gap-scale-sm-2">
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
          />
        </div>

        <div className="flex flex-col gap-scale-sm-2">
          <Label htmlFor="organizationName">
            Company <span className="text-[var(--text-muted)]">(optional)</span>
          </Label>
          <Input
            id="organizationName"
            name="organizationName"
            placeholder="Acme Inc"
          />
        </div>

        <div className="flex flex-col gap-scale-sm-2">
          <Label htmlFor="password">Password</Label>
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
                  disabled={isPending || isRedirecting}
          className="w-full"
        >
                  {isPending || isRedirecting ? <Loader2 className="animate-spin" /> : null}
          Create account
        </Button>
      </div>

      <p className="para-text-sm text-[var(--text-secondary)]">
        Already registered?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--text-primary)] underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}