"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Loader2,
  Trash2,
  Send,
  Pause,
  Play,
  CalendarClock,
  XCircle,
  Star,
  Mail,
  Plus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/store/Table";
import Button from "@/app/components/ui/store/Button";
import { Badge, EmptyState } from "@/app/components/dashboard/Card";
import {
  updateCampaignStatusAction,
  deleteCampaignAction,
} from "@/app/actions/campaigns";
import type { ActionResult } from "@/lib/action-result";

export type CampaignRow = {
  id: string;
  name: string;
  status: string;
  subject: string | null;
  scheduledAt: Date | null;
  createdAt: Date;
  recipientCount: number;
  queuedCount: number;
  sentCount: number;
};

const statusTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  COMPLETED: "success",
  SENDING: "warning",
  PAUSED: "warning",
  CANCELLED: "danger",
  DRAFT: "neutral",
  SCHEDULED: "neutral",
};

export function CampaignList({ campaigns }: { campaigns: CampaignRow[] }) {
  const router = useRouter();

  if (campaigns.length === 0) {
    return (
      <EmptyState
        title="No campaigns yet"
        description="Create a campaign, pick leads you have unlocked, and send from your own SMTP."
        icon={<Mail size={20} />}
        action={
          <Link href="/dashboard/campaigns/new">
            <Button variant="primary" icon={<Plus size={15} aria-hidden />}>
              Create your first campaign
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaign</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Recipients</TableHead>
          <TableHead>Sent</TableHead>
          <TableHead>Scheduled</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {campaigns.map((campaign) => (
          <CampaignRowItem key={campaign.id} campaign={campaign} onDone={() => router.refresh()} />
        ))}
      </TableBody>
    </Table>
  );
}

function CampaignRowItem({
  campaign,
  onDone,
}: {
  campaign: CampaignRow;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    updateCampaignStatusAction,
    null
  );

  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  const isSending = campaign.status === "SENDING";
  const isPaused = campaign.status === "PAUSED";

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-scale-sm-1">
          <a
            href={`/dashboard/campaigns/${campaign.id}`}
            className="font-medium text-[var(--text-primary)] underline-offset-2 hover:underline"
          >
            {campaign.name}
          </a>
          {campaign.subject ? (
            <span className="para-text-xxs text-[var(--text-muted)]">
              {campaign.subject}
            </span>
          ) : null}
        </div>
      </TableCell>

      <TableCell>
        <Badge tone={statusTone[campaign.status] ?? "neutral"}>{campaign.status}</Badge>
      </TableCell>

      <TableCell className="text-sm">{campaign.recipientCount}</TableCell>

      <TableCell className="text-sm">
        {campaign.sentCount}/{campaign.recipientCount}
      </TableCell>

      <TableCell className="text-sm">
        {campaign.scheduledAt
          ? new Date(campaign.scheduledAt).toLocaleString("en-US")
          : "—"}
      </TableCell>

      <TableCell>
        <div className="flex flex-wrap items-center justify-end gap-scale-sm-2">
          <form action={formAction}>
            <input type="hidden" name="campaignId" value={campaign.id} />
            <input type="hidden" name="action" value={isSending ? "pause" : isPaused ? "resume" : "start"} />
            <Button type="submit" variant="outline" className="h-9 px-3">
              {isSending ? (
                <Pause size={14} aria-hidden />
              ) : isPaused ? (
                <Play size={14} aria-hidden />
              ) : (
                <Send size={14} aria-hidden />
              )}
              {isSending ? "Pause" : isPaused ? "Resume" : "Start"}
            </Button>
          </form>

          <form action={formAction}>
            <input type="hidden" name="campaignId" value={campaign.id} />
            <input type="hidden" name="action" value="cancel" />
            <Button type="submit" variant="ghost" className="h-9 px-2.5">
              <XCircle size={15} aria-hidden />
              Cancel
            </Button>
          </form>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function CampaignControls({
  campaignId,
  status,
}: {
  campaignId: string;
  status: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    updateCampaignStatusAction,
    null
  );
  const [deleteState, deleteAction] = useActionState<ActionResult | null, FormData>(
    deleteCampaignAction,
    null
  );
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    if (state?.ok || deleteState?.ok) router.refresh();
  }, [state, deleteState, router]);

  return (
    <div className="flex flex-col gap-scale-sm-3">
      <div className="flex flex-wrap items-center gap-scale-sm-3">
        <form action={formAction}>
          <input type="hidden" name="campaignId" value={campaignId} />
          <input
            type="hidden"
            name="action"
            value={status === "SENDING" ? "pause" : status === "PAUSED" ? "resume" : "start"}
          />
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            icon={
              status === "SENDING" ? (
                <Pause size={15} aria-hidden />
              ) : status === "PAUSED" ? (
                <Play size={15} aria-hidden />
              ) : (
                <Send size={15} aria-hidden />
              )
            }
          >
            {status === "SENDING" ? "Pause sending" : status === "PAUSED" ? "Resume" : "Start sending"}
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowSchedule((value) => !value)}
          icon={<CalendarClock size={15} aria-hidden />}
        >
          Schedule
        </Button>

        <form action={formAction}>
          <input type="hidden" name="campaignId" value={campaignId} />
          <input type="hidden" name="action" value="cancel" />
          <Button type="submit" variant="ghost">
            <XCircle size={15} aria-hidden />
            Cancel
          </Button>
        </form>

        <form action={deleteAction}>
          <input type="hidden" name="id" value={campaignId} />
          <Button type="submit" variant="danger">
            <Trash2 size={15} aria-hidden />
            Delete
          </Button>
        </form>
      </div>

      {showSchedule ? (
        <form action={formAction} className="flex flex-wrap items-end gap-scale-sm-3">
          <input type="hidden" name="campaignId" value={campaignId} />
          <input type="hidden" name="action" value="schedule" />
          <div className="flex flex-col gap-scale-sm-2">
            <label htmlFor="scheduledAt" className="para-text-xs text-[var(--text-secondary)]">
              Send at
            </label>
            <input
              id="scheduledAt"
              type="datetime-local"
              name="scheduledAt"
              required
              className="h-10 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--text-primary)]"
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isPending}>
            Set schedule
          </Button>
        </form>
      ) : null}

      {state && !state.ok ? (
        <p role="alert" className="para-text-sm text-[var(--destructive)]">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="para-text-sm text-[var(--success)]">
          {state.message}
        </p>
      ) : null}
      {deleteState && !deleteState.ok ? (
        <p role="alert" className="para-text-sm text-[var(--destructive)]">
          {deleteState.error}
        </p>
      ) : null}
    </div>
  );
}

export function SubmitIcon({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? <Loader2 className="animate-spin" /> : <Star size={15} aria-hidden />}
      {pending ? label : label}
    </>
  );
}