"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Loader2,
  Monitor,
  Smartphone,
  Search,
  Check,
  Sparkles,
} from "lucide-react";
import { Card, Badge } from "@/app/components/dashboard/Card";
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
import { MERGE_TOKENS } from "@/lib/merge-tokens";
import { useOnChange } from "@/app/components/dashboard/useOnChange";
import { createCampaignAction } from "@/app/actions/campaigns";
import type { ActionResult } from "@/lib/action-result";

export type SelectableLead = {
  contactId: string;
  contactName: string;
  email: string;
  jobTitle: string | null;
  companyName: string;
};

export type SelectableSmtp = {
  id: string;
  name: string;
  fromEmail: string;
  isDefault: boolean;
  isVerified: boolean;
};

export type SelectableTemplate = {
  id: string;
  name: string;
  subject: string | null;
  htmlBody: string;
  mode: "AI" | "VISUAL" | "HTML";
};

/**
 * Live preview of the campaign email.
 * Merge tokens are shown as written so the author can see where they land.
 */
function EmailPreview({ html, subject }: { html: string; subject: string }) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");

  return (
    <Card
      title="Preview"
      description="Merge tokens are shown as written and replaced at send time."
      actions={
        <div className="flex items-center gap-scale-sm-2">
          <Button
            type="button"
            variant={mode === "desktop" ? "primary" : "outline"}
            onClick={() => setMode("desktop")}
            icon={<Monitor size={15} aria-hidden />}
          >
            Desktop
          </Button>
          <Button
            type="button"
            variant={mode === "mobile" ? "primary" : "outline"}
            onClick={() => setMode("mobile")}
            icon={<Smartphone size={15} aria-hidden />}
          >
            Mobile
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-scale-sm-4">
        <div className="flex flex-col gap-scale-sm-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-scale-sm-4">
          <div className="flex flex-col gap-scale-sm-1">
            <span className="para-text-xxs uppercase tracking-wider text-[var(--text-muted)]">
              Subject
            </span>
            <span className="para-text-sm font-medium text-[var(--text-primary)]">
              {subject || "No subject set"}
            </span>
          </div>
        </div>

        {html.trim() ? (
          <div
            className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]"
            style={{ height: "460px" }}
          >
            <iframe
              title="Email preview"
              srcDoc={html}
              className="h-full w-full border-0 bg-white"
              style={{
                width: mode === "desktop" ? "100%" : "390px",
                maxWidth: "100%",
              }}
            />
          </div>
        ) : (
          <p className="para-text-sm text-[var(--text-muted)]">
            Write an email body to see the preview.
          </p>
        )}
      </div>
    </Card>
  );
}

function SubmitButton({
  pendingLabel,
  disabled,
  selectedCount,
}: {
  pendingLabel: string;
  disabled: boolean;
  selectedCount: number;
}) {
  const { pending } = useFormStatus();

  const label =
    selectedCount > 0
      ? `Create campaign · ${selectedCount} recipient${selectedCount === 1 ? "" : "s"}`
      : "Create campaign";

  return (
    <Button type="submit" variant="primary" disabled={pending || disabled}>
      {pending ? <Loader2 className="animate-spin" /> : null}
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function CampaignComposer({
  leads,
  smtpAccounts,
  templates,
  defaultHtml,
  defaultSubject,
}: {
  leads: SelectableLead[];
  smtpAccounts: SelectableSmtp[];
  templates: SelectableTemplate[];
  defaultHtml: string;
  defaultSubject: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createCampaignAction, null);

  const [subject, setSubject] = useState(defaultSubject);
  const [html, setHtml] = useState(defaultHtml);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bodyError, setBodyError] = useState<string | null>(null);

  useOnChange(state, () => {
    if (state?.ok && state.data) {
      router.push(`/dashboard/campaigns/${state.data.id}`);
    }
  });

  const filtered = useMemo(() => {
    if (!query.trim()) return leads;
    const needle = query.trim().toLowerCase();
    return leads.filter(
      (lead) =>
        lead.companyName.toLowerCase().includes(needle) ||
        lead.contactName.toLowerCase().includes(needle) ||
        lead.email.toLowerCase().includes(needle)
    );
  }, [leads, query]);

  function toggleLead(contactId: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(contactId)) {
        next.delete(contactId);
      } else {
        next.add(contactId);
      }
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((previous) => {
      const next = new Set(previous);
      const allSelected = filtered.every((lead) => next.has(lead.contactId));

      for (const lead of filtered) {
        if (allSelected) {
          next.delete(lead.contactId);
        } else {
          next.add(lead.contactId);
        }
      }

      return next;
    });
  }

  const defaultAccount =
    smtpAccounts.find((account) => account.isDefault) ?? smtpAccounts[0];

  const hasSmtp = smtpAccounts.length > 0;
  const allVisibleSelected =
    filtered.length > 0 && filtered.every((lead) => selected.has(lead.contactId));

  return (
    <form
      action={formAction}
      onSubmit={() => {
        if (!html.trim()) {
          setBodyError("The email body cannot be empty.");
        }
      }}
      className="flex flex-col gap-scale-md-6"
    >
      <div className="grid gap-scale-md-6 xl:grid-cols-2">
        <div className="flex flex-col gap-scale-md-6">
          <Card title="Campaign details">
            <div className="flex flex-col gap-scale-sm-4">
              <div className="flex flex-col gap-scale-sm-2">
                <Label htmlFor="name">Campaign name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Q3 outreach — mid-market SaaS"
                />
              </div>

              <div className="flex flex-col gap-scale-sm-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="Optional" />
              </div>

              <div className="flex flex-col gap-scale-sm-2">
                <Label htmlFor="smtpAccountId">Sending account</Label>
                                <Select
                                  name="smtpAccountId"
                                  defaultValue={defaultAccount?.id ?? ""}
                                >
                                  <SelectTrigger id="smtpAccountId" className="h-12 rounded-xl px-4 text-sm">
                                    <SelectValue placeholder="Select a sending account" />
                                  </SelectTrigger>

                                  <SelectContent>
                                    {smtpAccounts.map((account) => (
                                      <SelectItem key={account.id} value={account.id}>
                                        {account.name} · {account.fromEmail}
                                        {account.isVerified ? "" : " (unverified)"}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                {!hasSmtp ? (
                  <p className="para-text-xxs text-[var(--destructive)]">
                    Connect an SMTP account before creating a campaign.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-scale-sm-4 sm:grid-cols-3">
                <div className="flex flex-col gap-scale-sm-2">
                  <Label htmlFor="dailyLimit">Daily limit</Label>
                  <Input
                    id="dailyLimit"
                    name="dailyLimit"
                    type="number"
                    min={1}
                    defaultValue={100}
                  />
                </div>
                <div className="flex flex-col gap-scale-sm-2">
                  <Label htmlFor="sendDelaySec">Delay (s)</Label>
                  <Input
                    id="sendDelaySec"
                    name="sendDelaySec"
                    type="number"
                    min={0}
                    defaultValue={2}
                  />
                </div>
                <div className="flex flex-col gap-scale-sm-2">
                  <Label htmlFor="maxRetries">Retries</Label>
                  <Input
                    id="maxRetries"
                    name="maxRetries"
                    type="number"
                    min={0}
                    defaultValue={2}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-scale-sm-2">
                <Label htmlFor="meetingLink">Meeting link</Label>
                <Input
                  id="meetingLink"
                  name="meetingLink"
                  placeholder="https://cal.example.com/yourname"
                />
                <p className="para-text-xxs text-[var(--text-muted)]">
                  Replaces {"{{meetingLink}}"} in the body.
                </p>
              </div>
            </div>
          </Card>

          <Card
            title="Email"
            description="Start from a saved template or paste your own HTML."
          >
            <div className="flex flex-col gap-scale-sm-4">
              {templates.length > 0 ? (
                <div className="flex flex-col gap-scale-sm-2">
                  <Label htmlFor="templatePicker">Start from a template</Label>
                  <div className="flex flex-wrap items-center gap-scale-sm-2">
                    <Select
                      value=""
                      onValueChange={(templateId: string) => {
                        const template = templates.find(
                          (entry) => entry.id === templateId
                        );
                        if (template) {
                          setHtml(template.htmlBody);
                          if (template.subject) setSubject(template.subject);
                        }
                      }}
                    >
                      <SelectTrigger
                        id="templatePicker"
                        className="h-10 min-w-[220px] flex-1 rounded-lg px-3 text-sm"
                      >
                        <SelectValue placeholder="Choose a template…" />
                      </SelectTrigger>

                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} ({template.mode.toLowerCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Link href="/dashboard/builder">
                      <Button
                        type="button"
                        variant="ghost"
                        icon={<Sparkles size={15} aria-hidden />}
                      >
                        Open builder
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-scale-sm-2">
                <Label htmlFor="subject">Subject line</Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="A quick idea for {{company}}"
                />
              </div>

              <div className="flex flex-col gap-scale-sm-2">
                <Label htmlFor="htmlBody">Email body (HTML)</Label>
                <textarea
                  id="htmlBody"
                  name="htmlBody"
                  required
                  rows={14}
                  value={html}
                  onChange={(event) => {
                    setHtml(event.target.value);
                    if (bodyError) setBodyError(null);
                  }}
                  placeholder="<p>Hi {{firstName}},</p>"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-[13px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none"
                />
                {bodyError ? (
                  <p role="alert" className="para-text-xs text-[var(--destructive)]">
                    {bodyError}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-scale-sm-2">
                <p className="para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Personalization tokens
                </p>
                <ul className="flex flex-wrap gap-scale-sm-1.5">
                  {MERGE_TOKENS.map((merge) => (
                    <li key={merge.token}>
                      <Badge tone="neutral">{merge.token}</Badge>
                    </li>
                  ))}
                </ul>
                <p className="para-text-xxs text-[var(--text-muted)]">
                  Insert these into the subject or body. They are replaced per
                  recipient when the campaign sends.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <EmailPreview html={html} subject={subject} />
      </div>

      <Card
        title={`Select leads (${selected.size} of ${leads.length} unlocked selected)`}
        description="Only leads you have unlocked can be added to a campaign."
      >
        <div className="flex flex-col gap-scale-sm-4">
          {leads.length === 0 ? (
            <div className="flex flex-col items-start gap-scale-sm-3">
              <p className="para-text-sm text-[var(--text-muted)]">
                You have no unlocked leads. Unlock some leads first.
              </p>
              <Link href="/dashboard/leads">
                <Button variant="outline" icon={<Search size={15} aria-hidden />}>
                  Find leads
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-scale-sm-3">
                <div className="min-w-[240px] flex-1">
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Filter by company, contact or email…"
                    aria-label="Filter leads"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={toggleAllVisible}
                  icon={<Check size={15} aria-hidden />}
                  disabled={filtered.length === 0}
                >
                  {allVisibleSelected ? "Clear visible" : "Select all visible"}
                </Button>
              </div>

              <ul className="max-h-[320px] overflow-y-auto divide-y divide-[var(--border)]">
                {filtered.map((lead) => (
                  <li key={lead.contactId}>
                    <label className="flex cursor-pointer items-center gap-scale-sm-3 px-scale-sm-2 py-scale-sm-2.5 hover:bg-[var(--surface-hover)]">
                      <input
                        type="checkbox"
                        name="contactIds"
                        value={lead.contactId}
                        checked={selected.has(lead.contactId)}
                        onChange={() => toggleLead(lead.contactId)}
                        className="size-4 accent-[var(--brand)]"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-scale-sm-1">
                        <span className="truncate para-text-sm text-[var(--text-primary)]">
                          {lead.contactName}
                          {lead.jobTitle ? (
                            <span className="text-[var(--text-muted)]">
                              {" "}
                              · {lead.jobTitle}
                            </span>
                          ) : null}
                        </span>
                        <span className="truncate para-text-xxs text-[var(--text-muted)]">
                          {lead.companyName} · {lead.email}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              {filtered.length === 0 ? (
                <p className="para-text-sm text-[var(--text-muted)]">
                  No leads match that filter.
                </p>
              ) : null}
            </>
          )}

          {state && !state.ok ? (
            <p role="alert" className="para-text-sm text-[var(--destructive)]">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-scale-sm-3">
            <SubmitButton
              pendingLabel="Creating…"
              disabled={!hasSmtp || leads.length === 0}
              selectedCount={selected.size}
            />
            <Badge tone="neutral">Merge tokens are replaced at send time</Badge>
          </div>
        </div>
      </Card>
    </form>
  );
}