"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, ShieldPlus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/store/Table";
import { Card, Badge, EmptyState } from "@/app/components/dashboard/Card";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/store/Select";
import { removeSuppressionAction, suppressEmailAction } from "@/app/actions/admin-users";
import type { ActionResult } from "@/lib/action-result";

export type SuppressionRow = {
  email: string;
  reason: string;
  source: string | null;
  createdAt: Date;
};

const reasonTone: Record<string, "danger" | "warning" | "neutral" | "brand"> = {
  BOUNCE: "danger",
  INVALID_EMAIL: "danger",
  DO_NOT_CONTACT: "danger",
  UNSUBSCRIBE: "warning",
  MANUAL: "neutral",
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
  variant?: "primary" | "outline" | "ghost";
  icon?: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending} className={className}>
      {pending ? <Loader2 className="animate-spin" /> : icon}
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function SuppressionManager({
  entries,
}: {
  entries: SuppressionRow[];
}) {
  const router = useRouter();
  const [addState, addAction] = useActionState<ActionResult | null, FormData>(
    suppressEmailAction,
    null
  );
  const [removeState, removeAction] = useActionState<ActionResult | null, FormData>(
    removeSuppressionAction,
    null
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (addState?.ok || removeState?.ok) router.refresh();
  }, [addState, removeState, router]);

  const filtered = entries.filter((entry) =>
    !query.trim() ? true : entry.email.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="flex flex-col gap-scale-md-6">
      <Card
        title="Suppression list"
        description="Addresses that must never receive outreach, whether they unsubscribed, bounced or were blocked manually."
      >
        <form action={addAction} className="flex flex-col gap-scale-sm-4">
          <div className="grid gap-scale-sm-4 sm:grid-cols-2">
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" name="email" type="email" required placeholder="blocked@example.com" />
            </div>

            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="reason">Reason</Label>
                            <Select name="reason" defaultValue="DO_NOT_CONTACT">
                              <SelectTrigger id="reason" className="h-12 rounded-xl px-4 text-sm">
                                <SelectValue />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectItem value="DO_NOT_CONTACT">Do not contact</SelectItem>
                                <SelectItem value="MANUAL">Manual block</SelectItem>
                                <SelectItem value="UNSUBSCRIBE">Unsubscribe</SelectItem>
                                <SelectItem value="BOUNCE">Hard bounce</SelectItem>
                                <SelectItem value="INVALID_EMAIL">Invalid email</SelectItem>
                              </SelectContent>
                            </Select>
            </div>
          </div>

          {addState && !addState.ok ? (
            <p role="alert" className="para-text-sm text-[var(--destructive)]">
              {addState.error}
            </p>
          ) : null}
          {addState?.ok ? (
            <p role="status" className="para-text-sm text-[var(--success)]">
              {addState.message}
            </p>
          ) : null}

          <SubmitButton
            pendingLabel="Adding…"
            icon={<ShieldPlus size={15} aria-hidden />}
            className="w-fit"
          >
            Add to suppression list
          </SubmitButton>
        </form>
      </Card>

      <Card
        title="Suppressed addresses"
        description={`${entries.length} addresses blocked from all outreach`}
      >
        <div className="flex flex-col gap-scale-md-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by email…"
            aria-label="Filter suppression list"
          />

          {filtered.length === 0 ? (
            <EmptyState
              title="No suppressed addresses"
              description="Addresses appear here automatically when someone unsubscribes or an email hard-bounces."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow key={entry.email}>
                    <TableCell className="text-sm text-[var(--text-primary)]">
                      {entry.email}
                    </TableCell>
                    <TableCell>
                      <Badge tone={reasonTone[entry.reason] ?? "neutral"}>
                        {entry.reason.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{entry.source ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <form action={removeAction}>
                          <input type="hidden" name="email" value={entry.email} />
                          <SubmitButton
                            pendingLabel="…"
                            variant="ghost"
                            className="h-9 px-2.5"
                            icon={<Trash2 size={14} aria-hidden />}
                          >
                            Remove
                          </SubmitButton>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}