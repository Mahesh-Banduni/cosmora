"use client";

import { useState } from "react";
import { Sparkles, Monitor, Smartphone, Code2, Plus, Trash2, GripVertical } from "lucide-react";
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

/* ==========================================================================
   Block model
   ========================================================================== */

export type BlockType =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "columns"
  | "signature";

export type EmailBlock = {
  id: string;
  type: BlockType;
  content: string;
  url?: string;
  align?: "left" | "center" | "right";
};

const BLOCK_LIBRARY: { type: BlockType; label: string }[] = [
  { type: "heading", label: "Heading" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "button", label: "Button" },
  { type: "divider", label: "Divider" },
  { type: "spacer", label: "Spacer" },
  { type: "columns", label: "Columns" },
  { type: "signature", label: "Signature" },
];

const uid = () => Math.random().toString(36).slice(2, 10);

const starterBlocks = (): EmailBlock[] => [
  { id: uid(), type: "heading", content: "A quick idea for {{company}}", align: "left" },
  {
    id: uid(),
    type: "text",
    content:
      "Hi {{firstName}},\n\nWe built something that helps {{jobTitle}} teams cut manual work. Would a 15-minute look be useful?",
    align: "left",
  },
  { id: uid(), type: "button", content: "Book a quick call", url: "{{meetingLink}}", align: "left" },
  { id: uid(), type: "divider", content: "" },
  { id: uid(), type: "signature", content: "{{senderName}}\n{{senderCompany}}" },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Renders the block tree to email-safe, inline-styled HTML.
 */
export function blocksToHtml(blocks: EmailBlock[]): string {
  const rows = blocks
    .map((block) => {
      const text = escapeHtml(block.content).replace(/\n/g, "<br />");

      switch (block.type) {
        case "heading":
          return `<tr><td style="padding:0 0 16px 0;"><h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;color:#191500;font-weight:700;">${text}</h1></td></tr>`;

        case "text":
          return `<tr><td style="padding:0 0 16px 0;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#3b3b3b;">${text}</p></td></tr>`;

        case "image":
          return `<tr><td style="padding:0 0 16px 0;" align="${block.align ?? "left"}"><img src="${escapeHtml(block.content)}" alt="" style="max-width:100%;height:auto;display:block;border:0;" /></td></tr>`;

        case "button":
          return `<tr><td style="padding:0 0 20px 0;" align="${block.align ?? "left"}"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#191500;border-radius:999px;"><a href="${escapeHtml(block.url ?? "")}" style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;">${text}</a></td></tr></table></td></tr>`;

        case "divider":
          return `<tr><td style="padding:4px 0 20px 0;"><div style="border-top:1px solid #e5e5e5;font-size:0;line-height:0;">&nbsp;</div></td></tr>`;

        case "spacer":
          return `<tr><td style="height:24px;line-height:24px;font-size:0;">&nbsp;</td></tr>`;

        case "columns":
          return `<tr><td style="padding:0 0 16px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="50%" style="padding-right:8px;vertical-align:top;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3b3b3b;">Column one<br />{{company}}</p></td>
              <td width="50%" style="padding-left:8px;vertical-align:top;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#3b3b3b;">Column two<br />{{industry}}</p></td>
            </tr></table></td></tr>`;

        case "signature":
          return `<tr><td style="padding:8px 0 0 0;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#5d5d55;">${text}</p></td></tr>`;

        default:
          return "";
      }
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Email</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:16px;border:1px solid #e5e5e5;">
          <tr><td style="padding:32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${rows}
            </table>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ==========================================================================
   Visual builder
   ========================================================================== */

export function VisualEmailBuilder({
  blocks,
  onChange,
}: {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
}) {
  function update(id: string, patch: Partial<EmailBlock>) {
    onChange(blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  }

  function remove(id: string) {
    onChange(blocks.filter((block) => block.id !== id));
  }

  function move(id: string, direction: -1 | 1) {
    const index = blocks.findIndex((block) => block.id === id);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= blocks.length) return;

    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="grid gap-scale-md-5 lg:grid-cols-[320px_1fr]">
      <div className="flex flex-col gap-scale-sm-4">
        <div className="flex flex-col gap-scale-sm-2">
          <p className="para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Add a block
          </p>
          <div className="grid grid-cols-2 gap-scale-sm-2">
            {BLOCK_LIBRARY.map((item) => (
              <Button
                key={item.type}
                type="button"
                variant="outline"
                onClick={() =>
                  onChange([
                    ...blocks,
                    { id: uid(), type: item.type, content: "", align: "left" },
                  ])
                }
                className="justify-start"
              >
                <Plus size={14} aria-hidden />
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-scale-sm-2">
          <p className="para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
            Personalization
          </p>
          <ul className="flex flex-wrap gap-scale-sm-1.5">
            {MERGE_TOKENS.map((merge) => (
              <li key={merge.token}>
                <Badge
                  tone="neutral"
                  className="cursor-default"
                >
                  {merge.token}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="para-text-xxs text-[var(--text-muted)]">
            Insert these tokens into any block. They are replaced per recipient
            at send time.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-scale-sm-3">
        {blocks.length === 0 ? (
          <p className="para-text-sm text-[var(--text-muted)]">
            No blocks yet. Add one from the library.
          </p>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              className="flex flex-col gap-scale-sm-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-scale-sm-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-scale-sm-3">
                <span className="flex items-center gap-scale-sm-2 para-text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  <GripVertical size={13} aria-hidden />
                  {block.type}
                </span>

                <div className="flex items-center gap-scale-sm-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => move(block.id, -1)}
                    disabled={index === 0}
                    aria-label="Move block up"
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => move(block.id, 1)}
                    disabled={index === blocks.length - 1}
                    aria-label="Move block down"
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => remove(block.id)}
                    aria-label={`Remove ${block.type} block`}
                  >
                    <Trash2 size={14} aria-hidden />
                  </Button>
                </div>
              </div>

              {block.type === "divider" || block.type === "spacer" ? null : (
                <div className="flex flex-col gap-scale-sm-2">
                  {block.type === "image" ? (
                    <Label htmlFor={`content-${block.id}`}>Image URL</Label>
                  ) : block.type === "button" ? (
                    <Label htmlFor={`content-${block.id}`}>Button label</Label>
                  ) : (
                    <Label htmlFor={`content-${block.id}`}>Content</Label>
                  )}

                  {block.type === "columns" ? (
                    <p className="para-text-xs text-[var(--text-muted)]">
                      Two-column layout using {"{{company}}"} and {"{{industry}}"}.
                    </p>
                  ) : block.type === "image" ? (
                    <Input
                      id={`content-${block.id}`}
                      value={block.content}
                      onChange={(event) => update(block.id, { content: event.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  ) : (
                    <textarea
                      id={`content-${block.id}`}
                      value={block.content}
                      onChange={(event) => update(block.id, { content: event.target.value })}
                      rows={block.type === "text" ? 5 : 2}
                      placeholder="Write your content…"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none"
                    />
                  )}
                </div>
              )}

              {block.type === "button" ? (
                <div className="flex flex-col gap-scale-sm-2">
                  <Label htmlFor={`url-${block.id}`}>Destination URL</Label>
                  <Input
                    id={`url-${block.id}`}
                    value={block.url ?? ""}
                    onChange={(event) => update(block.id, { url: event.target.value })}
                    placeholder="https://cal.example.com/30min"
                  />
                </div>
              ) : null}

              {block.type !== "image" && block.type !== "divider" && block.type !== "spacer" ? (
                <div className="flex flex-col gap-scale-sm-2">
                  <Label htmlFor={`align-${block.id}`}>Alignment</Label>
                                    <Select
                                      value={block.align ?? "left"}
                                      onValueChange={(align: string) =>
                                        update(block.id, { align: align as EmailBlock["align"] })
                                      }
                                    >
                                      <SelectTrigger
                                        id={`align-${block.id}`}
                                        className="h-10 w-40 rounded-lg px-3 text-sm"
                                      >
                                        <SelectValue />
                                      </SelectTrigger>

                                      <SelectContent>
                                        <SelectItem value="left">Left</SelectItem>
                                        <SelectItem value="center">Center</SelectItem>
                                        <SelectItem value="right">Right</SelectItem>
                                      </SelectContent>
                                    </Select>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   Preview
   ========================================================================== */

export function EmailPreview({
  html,
  subject,
  previewText,
}: {
  html: string;
  subject: string;
  previewText: string;
}) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");

  return (
    <Card
      title="Preview"
      description="Rendered with merge tokens in place."
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
        <div className="flex flex-col gap-scale-sm-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-scale-sm-4">
          <div className="flex flex-col gap-scale-sm-1">
            <span className="para-text-xxs uppercase tracking-wider text-[var(--text-muted)]">
              Subject
            </span>
            <span className="para-text-sm font-medium text-[var(--text-primary)]">
              {subject || "No subject set"}
            </span>
          </div>
          {previewText ? (
            <div className="flex flex-col gap-scale-sm-1">
              <span className="para-text-xxs uppercase tracking-wider text-[var(--text-muted)]">
                Preview text
              </span>
              <span className="para-text-xs text-[var(--text-secondary)]">
                {previewText}
              </span>
            </div>
          ) : null}
        </div>

        <div
          className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]"
          style={{ height: "520px" }}
        >
          <iframe
            title="Email preview"
            srcDoc={html}
            className="h-full w-full border-0 bg-white"
            style={{ width: mode === "desktop" ? "100%" : "390px", maxWidth: "100%" }}
          />
        </div>
      </div>
    </Card>
  );
}

export { starterBlocks, Code2, Sparkles };