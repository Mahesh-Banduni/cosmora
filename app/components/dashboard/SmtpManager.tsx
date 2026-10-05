"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Trash2, Plug, Send, ShieldCheck, Star } from "lucide-react";
import { Card, Badge, EmptyState } from "@/app/components/dashboard/Card";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";
import {
  createSmtpAccountAction,
  deleteSmtpAccountAction,
  sendTestEmailAction,
  setDefaultSmtpAction,
  testSmtpAccountAction,
} from "@/app/actions/campaigns";
import type { ActionResult } from "@/lib/action-result";

export type SmtpRow = {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromName: string;
  fromEmail: string;
  replyTo: string | null;
  isDefault: boolean;
  isVerified: boolean;
  lastTestedAt: Date | null;
  lastTestResult: string | null;
};

function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  icon,
  className = "",
}: {
  children?: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  icon?: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      className={className}
    >
      {pending ? <Loader2 className="animate-spin" /> : icon}
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function SmtpManager({ accounts }: { accounts: SmtpRow[] }) {
  const router = useRouter();

  const [saveState, saveAction] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createSmtpAccountAction, null);

  const [testState, testAction] = useActionState<
    ActionResult<{ result: string }> | null,
    FormData
  >(testSmtpAccountAction, null);

  useEffect(() => {
    if (saveState?.ok || testState?.ok) router.refresh();
  }, [saveState, testState, router]);

  return (
    <div className="flex flex-col gap-scale-md-6">
      <Card
        title="Connected accounts"
        description="Outreach is sent from your own email infrastructure."
        padded={true}
      >
        {accounts.length === 0 ? (
          <div className="p-scale-md-6">
            <EmptyState
              title="No SMTP accounts yet"
              description="Add your provider credentials below to start sending campaigns."
            />
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {accounts.map((account) => (
              <SmtpAccountRow key={account.id} account={account} />
            ))}
          </ul>
        )}
      </Card>

      <Card title="Add an SMTP account" description="Credentials are encrypted before they are stored.">
        <form action={saveAction} className="flex flex-col gap-scale-sm-4">
          <div className="grid gap-scale-sm-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="name">Label</Label>
              <Input id="name" name="name" required placeholder="Work — Google Workspace" />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="host">Host</Label>
              <Input id="host" name="host" required placeholder="smtp.example.com" />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="port">Port</Label>
              <Input id="port" name="port" type="number" min={1} defaultValue={587} required />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required autoComplete="off" />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="fromEmail">From email</Label>
              <Input id="fromEmail" name="fromEmail" type="email" required />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="fromName">From name</Label>
              <Input id="fromName" name="fromName" required />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="replyTo">Reply-to</Label>
              <Input id="replyTo" name="replyTo" type="email" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-scale-sm-4">
            <label className="flex items-center gap-scale-sm-2 para-text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                name="secure"
                defaultChecked
                className="size-4 accent-[var(--brand)]"
              />
              Use TLS/SSL (port 465)
            </label>

            <label className="flex items-center gap-scale-sm-2 para-text-sm text-[var(--text-secondary)]">
              <input type="checkbox" name="isDefault" className="size-4 accent-[var(--brand)]" />
              Use as the default sending account
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-scale-sm-3">
            <SubmitButton pendingLabel="Saving…" icon={<Plug size={15} aria-hidden />}>
              Save account
            </SubmitButton>
            <SubmitButton
              pendingLabel="Testing…"
              variant="outline"
              icon={<ShieldCheck size={15} aria-hidden />}
            >
              Test connection
            </SubmitButton>
          </div>

          {saveState && !saveState.ok ? (
            <p role="alert" className="para-text-sm text-[var(--destructive)]">
              {saveState.error}
            </p>
          ) : null}
          {saveState?.ok ? (
            <p role="status" className="para-text-sm text-[var(--success)]">
              {saveState.message}
            </p>
          ) : null}
          {testState && !testState.ok ? (
            <p role="alert" className="para-text-sm text-[var(--destructive)]">
              {testState.error}
            </p>
          ) : null}
          {testState?.ok ? (
            <p role="status" className="para-text-sm text-[var(--success)]">
              {testState.message}
            </p>
          ) : null}
        </form>
      </Card>
    </div>
  );
}

function SmtpAccountRow({ account }: { account: SmtpRow }) {
  const router = useRouter();

  const [defaultState, defaultAction] = useActionState<ActionResult | null, FormData>(
    setDefaultSmtpAction,
    null
  );
  const [deleteState, deleteAction] = useActionState<ActionResult | null, FormData>(
    deleteSmtpAccountAction,
    null
  );

  useEffect(() => {
    if (defaultState?.ok || deleteState?.ok) router.refresh();
  }, [defaultState, deleteState, router]);

  return (
    <li className="flex flex-col gap-scale-sm-3 px-scale-md-6 py-scale-md-4">
      <div className="flex flex-wrap items-start justify-between gap-scale-sm-3">
        <div className="flex min-w-0 flex-col gap-scale-sm-1">
          <span className="para-text-sm font-medium text-[var(--text-primary)]">
            {account.name}
          </span>
          <span className="para-text-xxs text-[var(--text-muted)]">
            {account.host}:{account.port} · {account.username} · {account.secure ? "TLS" : "STARTTLS"}
          </span>
          <span className="para-text-xxs text-[var(--text-secondary)]">
            {account.fromName} &lt;{account.fromEmail}&gt;
            {account.replyTo ? ` · replies to ${account.replyTo}` : ""}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-scale-sm-2">
          {account.isDefault ? <Badge tone="brand">Default</Badge> : null}
          <Badge tone={account.isVerified ? "success" : "warning"}>
            {account.isVerified ? "Verified" : "Unverified"}
          </Badge>
        </div>
      </div>

      {account.lastTestResult ? (
        <p className="para-text-xxs text-[var(--text-muted)]">
          Last test: {account.lastTestResult}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-scale-sm-2">
        <form action={defaultAction}>
          <input type="hidden" name="id" value={account.id} />
          <SubmitButton
            pendingLabel="…"
            variant="ghost"
            icon={<Star size={14} aria-hidden />}
          >
            {account.isDefault ? "Default" : "Make default"}
          </SubmitButton>
        </form>

        <form action={deleteAction}>
          <input type="hidden" name="id" value={account.id} />
          <SubmitButton
            pendingLabel="…"
            variant="ghost"
            icon={<Trash2 size={14} aria-hidden />}
          >
            Remove
          </SubmitButton>
        </form>
      </div>

      <TestEmailForm account={account} />
    </li>
  );
}

function TestEmailForm({ account }: { account: SmtpRow }) {
  const router = useRouter();
  const [state, action] = useActionState<ActionResult | null, FormData>(
    sendTestEmailAction,
    null
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={action} className="flex flex-wrap items-end gap-scale-sm-2">
      <input type="hidden" name="accountId" value={account.id} />

      <div className="min-w-[220px] flex-1">
        <label htmlFor={`recipient-${account.id}`} className="sr-only">
          Recipient
        </label>
        <Input
          id={`recipient-${account.id}`}
          name="recipient"
          type="email"
          required
          placeholder="Send a test to you@company.com"
        />
      </div>

      <SubmitButton
        pendingLabel="Sending…"
        variant="outline"
        icon={<Send size={14} aria-hidden />}
      >
        Send test email
      </SubmitButton>

      {state && !state.ok ? (
        <p role="alert" className="para-text-xxs text-[var(--destructive)]">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="para-text-xxs text-[var(--success)]">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}