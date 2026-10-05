"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { loginAction, type AuthState } from "@/app/actions/auth";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    loginAction,
    null
  );

  // Credentials are held client-side only long enough to hand them to
  // NextAuth's client signIn, which is what mints the session cookie.
  const credentialsRef = useRef({ email: "", password: "" });
    const navigatedRef = useRef(false);

  useEffect(() => {
      if (!state?.destination || navigatedRef.current) return;

      navigatedRef.current = true;
      const target = callbackUrl ?? state.destination;

    signIn("credentials", {
      ...credentialsRef.current,
      callbackUrl: target,
      redirect: false,
    })
      .then(() => {
        router.push(target);
        router.refresh();
      })
        .catch(() => {
          // Allow a retry if the session could not be established.
          navigatedRef.current = false;
        });
    }, [state, callbackUrl, router]);

    const isRedirecting = Boolean(state?.destination);

  function captureCredentials(form: HTMLFormElement) {
    const data = new FormData(form);
    credentialsRef.current = {
      email: String(data.get("email") ?? ""),
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
        <h2 className="h4">Welcome back</h2>
        <p className="para-text-sm text-[var(--text-secondary)]">
          Sign in to your Cosmora workspace.
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
          <Label htmlFor="email">Email</Label>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="para-text-xs text-[var(--text-muted)] underline-offset-2 hover:text-[var(--text-primary)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
                  disabled={isPending || isRedirecting}
          className="w-full"
        >
                  {isPending || isRedirecting ? <Loader2 className="animate-spin" /> : null}
          Sign in
        </Button>
      </div>

      <p className="para-text-sm text-[var(--text-secondary)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-[var(--text-primary)] underline-offset-2 hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}