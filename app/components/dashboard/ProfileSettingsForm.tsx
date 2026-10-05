"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Card } from "@/app/components/dashboard/Card";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";
import { updateProfileAction, type AuthState } from "@/app/actions/auth";

export function ProfileSettingsForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    updateProfileAction,
    null
  );

  return (
    <Card
      title="Profile"
      description="Update your name, email address or password."
    >
      <form action={formAction} className="flex flex-col gap-scale-sm-5">
        <div className="grid gap-scale-sm-4 sm:grid-cols-2">
          <div className="flex flex-col gap-scale-sm-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" defaultValue={name} required />
          </div>
          <div className="flex flex-col gap-scale-sm-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={email} required />
          </div>
        </div>

        <div className="grid gap-scale-sm-4 sm:grid-cols-2">
          <div className="flex flex-col gap-scale-sm-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="Only needed to set a new password"
            />
          </div>
          <div className="flex flex-col gap-scale-sm-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Leave blank to keep current"
            />
          </div>
        </div>

        {state?.error ? (
          <p role="alert" className="para-text-sm text-[var(--destructive)]">
            {state.error}
          </p>
        ) : null}
        {state?.success ? (
          <p role="status" className="para-text-sm text-[var(--success)]">
            {state.success}
          </p>
        ) : null}

        <SubmitButton pendingLabel="Saving…" isPending={isPending} />
      </form>
    </Card>
  );
}

function SubmitButton({
  pendingLabel,
  isPending,
}: {
  pendingLabel: string;
  isPending: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" disabled={pending || isPending} className="w-fit">
      {pending ? <Loader2 className="animate-spin" /> : null}
      {pending ? pendingLabel : "Save changes"}
    </Button>
  );
}