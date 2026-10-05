"use client";

import { useMemo, useState } from "react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Loader2, Sparkles, Code2, LayoutTemplate, Wand2 } from "lucide-react";
import { Card } from "@/app/components/dashboard/Card";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";
import {
  EmailPreview,
  VisualEmailBuilder,
  blocksToHtml,
  starterBlocks,
  type EmailBlock,
} from "@/app/components/email/VisualEmailBuilder";
import {
  generateEmailAction,
  saveEmailTemplateAction,
} from "@/app/actions/campaigns";
import type { ActionResult } from "@/lib/action-result";
import type { GeneratedEmail } from "@/lib/lead-intelligence";

type Mode = "ai" | "visual" | "html";

const MODE_META: { value: Mode; label: string; icon: React.ReactNode; hint: string }[] = [
  {
    value: "ai",
    label: "AI generator",
    icon: <Wand2 size={15} aria-hidden />,
    hint: "Describe the offer and let AI draft subject, body and CTA.",
  },
  {
    value: "visual",
    label: "Visual builder",
    icon: <LayoutTemplate size={15} aria-hidden />,
    hint: "Compose with blocks and preview on desktop and mobile.",
  },
  {
    value: "html",
    label: "HTML editor",
    icon: <Code2 size={15} aria-hidden />,
    hint: "Paste or edit raw HTML and preview the result.",
  },
];

function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
  icon,
}: {
  children?: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
  icon?: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending} className={className}>
      {pending ? <Loader2 className="animate-spin" /> : icon}
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function EmailBuilderStudio() {
  const [mode, setMode] = useState<Mode>("ai");

  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [html, setHtml] = useState("");
  const [blocks, setBlocks] = useState<EmailBlock[]>(() => starterBlocks());

  const visualHtml = useMemo(() => blocksToHtml(blocks), [blocks]);
  const effectiveHtml = mode === "visual" ? visualHtml : html;
  const templateMode = mode === "visual" ? "VISUAL" : mode === "ai" ? "AI" : "HTML";

  return (
    <div className="flex flex-col gap-scale-md-6">
      <Card
        title="How do you want to create this email?"
        description="All three modes produce the same email. Switch at any time."
      >
        <div className="grid gap-scale-sm-4 sm:grid-cols-3">
          {MODE_META.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
              aria-pressed={mode === item.value}
              className={`
                flex flex-col items-start gap-scale-sm-2 rounded-xl border p-scale-md-4 text-left transition
                ${
                  mode === item.value
                    ? "border-[var(--brand)] bg-[var(--surface-hover)]"
                    : "border-[var(--border)] hover:bg-[var(--surface-hover)]"
                }
              `}
            >
              <span className="flex items-center gap-scale-sm-2 h7">
                {item.icon}
                {item.label}
              </span>
              <span className="para-text-xxs text-[var(--text-secondary)]">
                {item.hint}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-scale-md-6 xl:grid-cols-2">
        <div className="flex flex-col gap-scale-md-6">
          {mode === "ai" ? (
            <AiGenerator
              onGenerated={(generated) => {
                setSubject(generated.subject);
                setPreviewText(generated.previewText);
                setHtml(generated.bodyHtml);
              }}
            />
          ) : null}

          {mode === "visual" ? (
            <Card
              title="Compose"
              description="Add blocks, then reorder or remove them."
            >
              <VisualEmailBuilder blocks={blocks} onChange={setBlocks} />
            </Card>
          ) : null}

          {mode === "html" ? (
            <Card title="HTML" description="Paste or edit your markup directly.">
              <div className="flex flex-col gap-scale-sm-3">
                <textarea
                  value={html}
                  onChange={(event) => setHtml(event.target.value)}
                  rows={18}
                  spellCheck={false}
                  placeholder="<!doctype html>…"
                  aria-label="Email HTML"
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-[13px] leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none"
                />
                <p className="para-text-xxs text-[var(--text-muted)]">
                  Use merge tokens such as {"{{firstName}}"} or {"{{company}}"} to
                  personalise per recipient.
                </p>
              </div>
            </Card>
          ) : null}

          <Card
            title="Subject and preview"
            description="Shown in the recipient's inbox."
          >
            <div className="flex flex-col gap-scale-sm-4">
              <div className="flex flex-col gap-scale-sm-2">
                <Label htmlFor="subject">Subject line</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="A quick idea for {{company}}"
                />
              </div>
              <div className="flex flex-col gap-scale-sm-2">
                <Label htmlFor="previewText">Preview text</Label>
                <Input
                  id="previewText"
                  value={previewText}
                  onChange={(event) => setPreviewText(event.target.value)}
                  placeholder="Optional text shown after the subject."
                />
              </div>
            </div>
          </Card>

          <SaveTemplateCard
            name={subject.slice(0, 40)}
            subject={subject}
            html={effectiveHtml}
            mode={templateMode}
            blocks={mode === "visual" ? JSON.stringify(blocks) : ""}
          />
        </div>

        <EmailPreview html={effectiveHtml} subject={subject} previewText={previewText} />
      </div>
    </div>
  );
}

function AiGenerator({
  onGenerated,
}: {
  onGenerated: (generated: GeneratedEmail) => void;
}) {
  const [state, action, isPending] = useActionState<
    ActionResult<GeneratedEmail> | null,
    FormData
  >(generateEmailAction, null);

  useEffect(() => {
    if (state?.ok && state.data) {
      onGenerated(state.data);
    }
  }, [state, onGenerated]);

  return (
    <Card
      title="AI generator"
      description="Give the model context and it drafts a complete first email."
    >
      <form action={action} className="flex flex-col gap-scale-sm-4">
        <div className="flex flex-col gap-scale-sm-2">
          <Label htmlFor="productOrService">What are you selling?</Label>
          <Input
            id="productOrService"
            name="productOrService"
            required
            placeholder="A revenue intelligence platform"
          />
        </div>

        <div className="flex flex-col gap-scale-sm-2">
          <Label htmlFor="valueProposition">Value proposition</Label>
          <Input
            id="valueProposition"
            name="valueProposition"
            placeholder="Forecast revenue and spot risk before the quarter closes"
          />
        </div>

        <div className="grid gap-scale-sm-4 sm:grid-cols-2">
          <div className="flex flex-col gap-scale-sm-2">
            <Label htmlFor="audience">Audience</Label>
            <Input
              id="audience"
              name="audience"
              placeholder="VP Sales at mid-market SaaS companies"
            />
          </div>
          <div className="flex flex-col gap-scale-sm-2">
            <Label htmlFor="tone">Tone</Label>
            <Input id="tone" name="tone" defaultValue="Professional and concise" />
          </div>
        </div>

        <div className="grid gap-scale-sm-4 sm:grid-cols-2">
          <div className="flex flex-col gap-scale-sm-2">
            <Label htmlFor="callToAction">Call to action</Label>
            <Input
              id="callToAction"
              name="callToAction"
              placeholder="Book a 15-minute walkthrough"
            />
          </div>
          <div className="flex flex-col gap-scale-sm-2">
            <Label htmlFor="senderName">Sender name</Label>
            <Input id="senderName" name="senderName" placeholder="Alex Morgan" />
          </div>
        </div>

        <div className="flex flex-col gap-scale-sm-2">
          <Label htmlFor="instructions">Extra instructions</Label>
          <Input
            id="instructions"
            name="instructions"
            placeholder="Keep it under 90 words, mention compliance"
          />
        </div>

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

        <SubmitButton
          pendingLabel="Generating…"
          variant="secondary"
          icon={<Sparkles size={15} aria-hidden />}
          className="w-fit"
        >
          Generate email
        </SubmitButton>

        {isPending ? (
          <p className="para-text-xs text-[var(--text-muted)]">
            This usually takes a few seconds.
          </p>
        ) : null}
      </form>
    </Card>
  );
}

function SaveTemplateCard({
  name,
  subject,
  html,
  mode,
  blocks,
}: {
  name: string;
  subject: string;
  html: string;
  mode: string;
  blocks: string;
}) {
  const router = useRouter();
  const [state, action] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(saveEmailTemplateAction, null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <Card
      title="Save as template"
      description="Reuse this design in future campaigns."
    >
      <form action={action} className="flex flex-col gap-scale-sm-4">
        <input type="hidden" name="subject" value={subject} />
        <input type="hidden" name="htmlBody" value={html} />
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="blocks" value={blocks} />

        <div className="flex flex-col gap-scale-sm-2">
          <Label htmlFor="templateName">Template name</Label>
          <Input
            id="templateName"
            name="name"
            required
            defaultValue={name || "Untitled template"}
          />
        </div>

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

        <SubmitButton pendingLabel="Saving…" variant="outline" className="w-fit">
          Save template
        </SubmitButton>
      </form>
    </Card>
  );
}