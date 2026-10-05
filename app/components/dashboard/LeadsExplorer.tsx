"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useOnChange } from "@/app/components/dashboard/useOnChange";
import {
  Loader2,
  Lock,
  Unlock,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Building2,
  Mail,
  Phone,
  StickyNote,
  Plus,
  Tag,
} from "lucide-react";
import { Badge, EmptyState } from "@/app/components/dashboard/Card";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import SearchInput from "@/app/components/ui/store/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/store/Select";
import {
  unlockLeadAction,
  toggleSavedLeadAction,
  explainScoreAction,
  addTagAction,
  removeTagAction,
  addNoteAction,
  deleteNoteAction,
} from "@/app/actions/leads";
import { updateStatusFormAction } from "@/app/actions/lead-status";
import type { ActionResult } from "@/lib/action-result";

export type LeadRow = {
  id: string;
  availability: "HIDDEN" | "PREVIEW" | "UNLOCKED";
  status: string;
  company: {
    id: string;
    name: string;
    domain: string | null;
    industry: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    employeeCount: number | null;
    website: string | null;
  };
  contactPreview: { name: string; jobTitle: string | null } | null;
  score: number | null;
  icpId: string | null;
  icpName: string | null;
  explanation: string | null;
  matchedCriteria: string[];
  isSaved: boolean;
  tags: { name: string; color: string | null }[];
  notes: { id: string; body: string }[];
  contact: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string | null;
    email: string;
    phone: string | null;
    linkedinUrl: string | null;
  } | null;
};

const statusOptions = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "CONVERTED",
  "DO_NOT_CONTACT",
] as const;

function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
  icon,
}: {
  children?: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  className?: string;
  icon?: React.ReactNode;
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

export function LeadsExplorer({
  leads,
  credits,
  query,
  filter,
}: {
  leads: LeadRow[];
  credits: number;
  query: string;
  filter: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const [status, setStatus] = useState(filter);

  function applyFilters() {
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (status && status !== "ALL") params.set("status", status);
    router.push(`/dashboard/leads?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-scale-md-5">
      <form
        className="flex flex-wrap items-end gap-scale-sm-3"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
      >
        <div className="min-w-[240px] flex-1">
          <label
            htmlFor="lead-search"
            className="mb-scale-sm-2 block para-text-xs text-[var(--text-secondary)]"
          >
            Search leads
          </label>
          <SearchInput
            id="lead-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => {
              setSearch("");
              router.push("/dashboard/leads");
            }}
            placeholder="Company, industry, country, contact…"
          />
        </div>

        <div className="w-full sm:w-52">
          <label
            htmlFor="status-filter"
            className="mb-scale-sm-2 block para-text-xs text-[var(--text-secondary)]"
          >
            Status
          </label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status-filter" className="h-12 w-full rounded-xl px-4 text-sm">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        {statusOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
        </div>

        <SubmitButton pendingLabel="Loading…" variant="outline">
          Filter
        </SubmitButton>
      </form>

      <div className="flex items-center justify-between gap-scale-sm-3">
        <span className="para-text-xs text-[var(--text-muted)]">
          {leads.length} leads · {credits} credits available
        </span>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          title="No leads found"
          description="Run an ICP match to populate your lead list, or adjust your filters."
          icon={<Building2 size={20} />}
        />
      ) : (
        <ul className="flex flex-col gap-scale-md-4">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </ul>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: LeadRow }) {
  const router = useRouter();
  const isUnlocked = lead.availability === "UNLOCKED" || Boolean(lead.contact);

  return (
    <li className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-scale-md-5">
      <div className="flex flex-col gap-scale-md-4">
        <div className="flex flex-wrap items-start justify-between gap-scale-sm-4">
          <div className="flex min-w-0 flex-col gap-scale-sm-2">
            <div className="flex flex-wrap items-center gap-scale-sm-2">
              <h3 className="h6">{lead.company.name}</h3>
              {lead.score !== null ? (
                <Badge
                  tone={
                    lead.score >= 75
                      ? "success"
                      : lead.score >= 50
                        ? "warning"
                        : "neutral"
                  }
                >
                  {lead.score}/100 match
                </Badge>
              ) : null}
              <Badge
                tone={
                  lead.status === "CONVERTED"
                    ? "success"
                    : lead.status === "DO_NOT_CONTACT" || lead.status === "UNQUALIFIED"
                      ? "danger"
                      : "neutral"
                }
              >
                {lead.status.replace("_", " ")}
              </Badge>
            </div>

            <p className="para-text-xs text-[var(--text-secondary)]">
              {[
                lead.company.industry,
                [lead.company.city, lead.company.country].filter(Boolean).join(", "),
                lead.company.employeeCount !== null
                  ? `${lead.company.employeeCount} employees`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ") || "No firmographic data"}
            </p>

            {lead.icpName ? (
              <p className="para-text-xxs text-[var(--text-muted)]">
                Matched via ICP: {lead.icpName}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-scale-sm-2">
            <LeadActions lead={lead} isUnlocked={isUnlocked} />
          </div>
        </div>

        {lead.matchedCriteria.length > 0 ? (
          <ul className="flex flex-wrap gap-scale-sm-1.5">
            {lead.matchedCriteria.map((criterion) => (
              <li key={criterion}>
                <Badge tone="neutral">{criterion}</Badge>
              </li>
            ))}
          </ul>
        ) : null}

        {isUnlocked && lead.contact ? (
          <ContactDetails lead={lead} />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-scale-sm-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)] px-scale-md-4 py-scale-md-3">
            <p className="para-text-xs text-[var(--text-secondary)]">
              Contact details are hidden. Unlock this lead to see the full record and
              contact it from a campaign.
            </p>
            <UnlockButton leadId={lead.id} />
          </div>
        )}

        {isUnlocked ? <LeadWorkspace lead={lead} /> : null}
      </div>
    </li>
  );
}

function LeadActions({ lead, isUnlocked }: { lead: LeadRow; isUnlocked: boolean }) {
  const router = useRouter();

  const [savedState, savedAction] = useActionState<
    ActionResult<{ saved: boolean }> | null,
    FormData
  >(toggleSavedLeadAction, null);

  useEffect(() => {
    if (savedState?.ok) router.refresh();
  }, [savedState, router]);

  return (
    <>
      <form action={savedAction}>
        <input type="hidden" name="leadId" value={lead.id} />
        <SubmitButton
          pendingLabel="…"
          variant={lead.isSaved ? "primary" : "outline"}
          icon={
            lead.isSaved ? (
              <BookmarkCheck size={15} aria-hidden />
            ) : (
              <Bookmark size={15} aria-hidden />
            )
          }
        >
          {lead.isSaved ? "Saved" : "Save"}
        </SubmitButton>
      </form>
    </>
  );
}

function UnlockButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [state, action] = useActionState<ActionResult | null, FormData>(
    unlockLeadAction,
    null
  );

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-scale-sm-2">
      <input type="hidden" name="leadId" value={leadId} />
      {state && !state.ok ? (
        <p role="alert" className="para-text-xxs text-[var(--destructive)]">
          {state.error}
        </p>
      ) : null}
      <SubmitButton
        pendingLabel="Unlocking…"
        variant="secondary"
        icon={<Unlock size={15} aria-hidden />}
      >
        Unlock · 1 credit
      </SubmitButton>
    </form>
  );
}

function ContactDetails({ lead }: { lead: LeadRow }) {
  const contact = lead.contact!;

  return (
    <div className="flex flex-col gap-scale-sm-4 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-scale-md-4">
      <div className="flex flex-col gap-scale-sm-3">
        <p className="para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
          Primary contact
        </p>
        <p className="h7">
          {contact.firstName} {contact.lastName}
        </p>
        {contact.jobTitle ? (
          <p className="para-text-xs text-[var(--text-secondary)]">{contact.jobTitle}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-scale-sm-4">
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-scale-sm-2 para-text-xs text-[var(--text-primary)] underline-offset-2 hover:underline"
        >
          <Mail size={14} aria-hidden />
          {contact.email}
        </a>

        {contact.phone ? (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-scale-sm-2 para-text-xs text-[var(--text-primary)] underline-offset-2 hover:underline"
          >
            <Phone size={14} aria-hidden />
            {contact.phone}
          </a>
        ) : null}

        {contact.linkedinUrl ? (
          <a
            href={contact.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-scale-sm-2 para-text-xs text-[var(--text-primary)] underline-offset-2 hover:underline"
          >
            <Building2 size={14} aria-hidden />
            LinkedIn
          </a>
        ) : null}
      </div>
    </div>
  );
}

function LeadWorkspace({ lead }: { lead: LeadRow }) {
  const router = useRouter();

  // Select exposes no native change event, so the status select submits
  // its form through an explicit ref.
  const statusFormRef = useRef<HTMLFormElement>(null);

  return (
    <div className="flex flex-col gap-scale-md-5 border-t border-[var(--border)] pt-scale-md-4">
      <div className="flex flex-wrap items-end gap-scale-sm-4">
        <form action={updateStatusFormAction} className="flex items-end gap-scale-sm-2" ref={statusFormRef}>
          <input type="hidden" name="leadId" value={lead.id} />
          <div className="flex flex-col gap-scale-sm-2">
            <label
              htmlFor={`status-${lead.id}`}
              className="para-text-xxs text-[var(--text-muted)]"
            >
              Lead status
            </label>
                    <Select
                      name="status"
                      defaultValue={lead.status}
                      onValueChange={() => statusFormRef.current?.requestSubmit()}
                    >
                      <SelectTrigger id={`status-${lead.id}`} className="h-10 rounded-lg px-3 text-sm">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </form>

        {lead.icpId ? <ScoreExplainer lead={lead} /> : null}
      </div>

      <TagManager lead={lead} />
      <NoteManager lead={lead} />
    </div>
  );
}

function ScoreExplainer({ lead }: { lead: LeadRow }) {
  const router = useRouter();
  const [state, action] = useActionState<
    ActionResult<{ explanation: string }> | null,
    FormData
  >(explainScoreAction, null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-scale-sm-2">
      <input type="hidden" name="leadId" value={lead.id} />
      <input type="hidden" name="icpId" value={lead.icpId ?? ""} />
      <SubmitButton
        pendingLabel="Explaining…"
        variant="ghost"
        icon={<Sparkles size={15} aria-hidden />}
      >
        Explain this score
      </SubmitButton>

      {state && !state.ok ? (
        <p role="alert" className="para-text-xxs text-[var(--destructive)]">
          {state.error}
        </p>
      ) : null}

      {lead.explanation ? (
        <p className="max-w-[60ch] para-text-xs text-[var(--text-secondary)]">
          {lead.explanation}
        </p>
      ) : null}
    </form>
  );
}

function TagManager({ lead }: { lead: LeadRow }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [addState, addAction] = useActionState<ActionResult | null, FormData>(
    addTagAction,
    null
  );
  const [removeState, removeAction] = useActionState<ActionResult | null, FormData>(
    removeTagAction,
    null
  );

  useOnChange(addState, () => {
      if (!addState?.ok) return;
      setName("");
      router.refresh();
    });

    useOnChange(removeState, () => {
      if (removeState?.ok) router.refresh();
    });

  return (
    <div className="flex flex-col gap-scale-sm-3">
      <p className="flex items-center gap-scale-sm-2 para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
        <Tag size={13} aria-hidden />
        Tags
      </p>

      {lead.tags.length > 0 ? (
        <ul className="flex flex-wrap gap-scale-sm-2">
          {lead.tags.map((tag) => (
            <li key={tag.name}>
              <Badge tone="brand">
                <span>{tag.name}</span>
                <form action={removeAction} className="ml-1 inline">
                  <input type="hidden" name="leadId" value={lead.id} />
                  <input type="hidden" name="name" value={tag.name} />
                  <button
                    type="submit"
                    aria-label={`Remove tag ${tag.name}`}
                    className="opacity-70 transition hover:opacity-100"
                  >
                    ×
                  </button>
                </form>
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="para-text-xxs text-[var(--text-muted)]">No tags yet.</p>
      )}

      <form action={addAction} className="flex flex-wrap items-center gap-scale-sm-2">
        <input type="hidden" name="leadId" value={lead.id} />
        <div className="min-w-[180px] flex-1">
          <Input
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Add a tag (e.g. enterprise)"
            aria-label="Tag name"
          />
        </div>
        <SubmitButton
          pendingLabel="Adding…"
          variant="outline"
          icon={<Plus size={14} aria-hidden />}
        >
          Add
        </SubmitButton>
      </form>
    </div>
  );
}

function NoteManager({ lead }: { lead: LeadRow }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [addState, addAction] = useActionState<ActionResult | null, FormData>(
    addNoteAction,
    null
  );
  const [removeState, removeAction] = useActionState<ActionResult | null, FormData>(
    deleteNoteAction,
    null
  );

  useOnChange(addState, () => {
      if (!addState?.ok) return;
      setBody("");
      router.refresh();
    });

    useOnChange(removeState, () => {
      if (removeState?.ok) router.refresh();
    });

  return (
    <div className="flex flex-col gap-scale-sm-3">
      <p className="flex items-center gap-scale-sm-2 para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
        <StickyNote size={13} aria-hidden />
        Notes
      </p>

      {lead.notes.length > 0 ? (
        <ul className="flex flex-col gap-scale-sm-2">
          {lead.notes.map((note) => (
            <li
              key={note.id}
              className="flex items-start justify-between gap-scale-sm-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-scale-sm-3 py-scale-sm-2.5"
            >
              <p className="para-text-xs text-[var(--text-secondary)]">{note.body}</p>
              <form action={removeAction}>
                <input type="hidden" name="id" value={note.id} />
                <button
                  type="submit"
                  aria-label="Delete note"
                  className="para-text-xs text-[var(--text-muted)] transition hover:text-[var(--destructive)]"
                >
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="para-text-xxs text-[var(--text-muted)]">No notes yet.</p>
      )}

      <form action={addAction} className="flex flex-col gap-scale-sm-2">
        <input type="hidden" name="leadId" value={lead.id} />
        <textarea
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={2}
          placeholder="Add context for your team…"
          aria-label="Note"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none"
        />
        <SubmitButton
          pendingLabel="Saving…"
          variant="outline"
          icon={<Plus size={14} aria-hidden />}
          className="w-fit"
        >
          Add note
        </SubmitButton>
      </form>
    </div>
  );
}

export { Lock };