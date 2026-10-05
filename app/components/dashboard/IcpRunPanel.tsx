"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Play, Trash2 } from "lucide-react";
import { Card } from "@/app/components/dashboard/Card";
import Button from "@/app/components/ui/store/Button";
import {
  runMatchAction,
  deleteIcpAction,
} from "@/app/actions/leads";
import type { ActionResult } from "@/lib/action-result";

function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  icon,
}: {
  children?: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "outline" | "ghost" | "danger";
  icon?: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : icon}
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function IcpRunPanel({
  icpId,
  matchCount,
  lastMatchedAt,
}: {
  icpId: string;
  matchCount: number;
  lastMatchedAt: string | null;
}) {
  const router = useRouter();

  const [matchState, matchAction, isMatching] = useActionState<
    ActionResult<{ matched: number; total: number }> | null,
    FormData
  >(runMatchAction, null);

  const [deleteState, deleteAction] = useActionState<ActionResult | null, FormData>(
    deleteIcpAction,
    null
  );

  useEffect(() => {
    if (matchState?.ok) router.refresh();
    if (deleteState?.ok) router.push("/dashboard/icps");
  }, [matchState, deleteState, router]);

  return (
    <Card
      title="Run matching"
      description="Scan the lead database and score every company against this ICP."
    >
      <div className="flex flex-col gap-scale-sm-4">
        <div className="grid gap-scale-sm-5 sm:grid-cols-3">
          <div className="flex flex-col gap-scale-sm-1">
            <span className="para-text-xxs uppercase tracking-wider text-[var(--text-muted)]">
              Total matches
            </span>
            <span className="text-[24px] font-semibold leading-none text-[var(--text-primary)]">
              {matchCount}
            </span>
          </div>
          <div className="flex flex-col gap-scale-sm-1">
            <span className="para-text-xxs uppercase tracking-wider text-[var(--text-muted)]">
              Last run
            </span>
            <span className="para-text-sm text-[var(--text-primary)]">
              {lastMatchedAt ?? "Never"}
            </span>
          </div>
          <div className="flex flex-col gap-scale-sm-1">
            <span className="para-text-xxs uppercase tracking-wider text-[var(--text-muted)]">
              Latest run
            </span>
            <span className="para-text-sm text-[var(--text-primary)]">
                          {matchState?.ok && matchState.data
                ? `${matchState.data.matched} of ${matchState.data.total}`
                : "—"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-scale-sm-3">
          <form action={matchAction}>
            <input type="hidden" name="icpId" value={icpId} />
            <SubmitButton
              pendingLabel="Matching…"
              icon={<Play size={15} aria-hidden />}
            >
              Run matching now
            </SubmitButton>
          </form>

          <form action={deleteAction}>
            <input type="hidden" name="id" value={icpId} />
            <SubmitButton
              pendingLabel="Deleting…"
              variant="ghost"
              icon={<Trash2 size={15} aria-hidden />}
            >
              Delete ICP
            </SubmitButton>
          </form>
        </div>

        {isMatching ? (
          <p className="para-text-xs text-[var(--text-muted)]">
            Evaluating companies. This can take a moment on a large database.
          </p>
        ) : null}

        {matchState && !matchState.ok ? (
          <p role="alert" className="para-text-sm text-[var(--destructive)]">
            {matchState.error}
          </p>
        ) : null}
        {matchState?.ok ? (
          <p role="status" className="para-text-sm text-[var(--success)]">
            {matchState.message}
          </p>
        ) : null}
        {deleteState && !deleteState.ok ? (
          <p role="alert" className="para-text-sm text-[var(--destructive)]">
            {deleteState.error}
          </p>
        ) : null}
      </div>
    </Card>
  );
}