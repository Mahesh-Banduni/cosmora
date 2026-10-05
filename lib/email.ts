import { MERGE_TOKENS } from "@/lib/merge-tokens";

export { MERGE_TOKENS };

export type PersonalizationContext = {
  contact: {
    firstName: string | null;
    lastName: string | null;
    jobTitle: string | null;
  };
  company: {
    name: string | null;
    industry: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    website: string | null;
  };
  sender: {
    name: string;
    email: string;
    company: string | null;
  };
  meetingLink: string | null;
};

function fallback(token: string, context: PersonalizationContext): string {
  switch (token) {
    case "firstName":
      return context.contact.firstName ?? "there";
    case "lastName":
      return context.contact.lastName ?? "";
    case "company":
      return context.company.name ?? "your team";
    case "jobTitle":
      return context.contact.jobTitle ?? "";
    case "industry":
      return context.company.industry ?? "";
    case "country":
      return context.company.country ?? "";
    case "state":
      return context.company.state ?? "";
    case "city":
      return context.company.city ?? "";
    case "website":
      return context.company.website ?? "";
    case "senderName":
      return context.sender.name;
    case "senderCompany":
      return context.sender.company ?? context.sender.name;
    case "senderEmail":
      return context.sender.email;
    case "meetingLink":
      return context.meetingLink ?? "";
    default:
      return "";
  }
}

/**
 * Replaces `{{token}}` merge fields. Tokens with no value degrade to a
 * readable fallback instead of leaving raw braces in the email.
 */
export function personalize(
  template: string,
  context: PersonalizationContext
): string {
  return template.replace(/\{\{\s*([a-zA-Z]+)\s*\}\}/g, (match, rawToken: string) => {
    const token = rawToken.trim();
    const value = fallback(token, context);

    if (value) return value;
    return token === "firstName" ? fallback(token, context) : "";
  });
}

export function extractUsedTokens(template: string): string[] {
  const found = new Set<string>();

  for (const match of template.matchAll(/\{\{\s*([a-zA-Z]+)\s*\}\}/g)) {
    found.add(`{{${match[1].trim()}}}`);
  }

  return [...found];
}

/* ==========================================================================
   Tracking
   ========================================================================== */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function buildUnsubscribeUrl(token: string): string {
  return `${BASE_URL}/api/email/unsubscribe?token=${token}`;
}

/**
 * Injects the open-tracking pixel and rewrites anchors so clicks route
 * through the tracking endpoint before reaching the destination.
 */
export function injectTracking(html: string, token: string): string {
  const pixel = `<img src="${BASE_URL}/api/email/open?token=${token}" width="1" height="1" alt="" style="display:none;opacity:0" />`;

  let tracked = html.replace(
    /<a\s+([^>]*?)href=(["'])(https?:\/\/[^"']+)\2([^>]*)>/gi,
    (match, before: string, _quote: string, href: string, after: string) => {
      const redirect = `${BASE_URL}/api/email/click?token=${token}&url=${encodeURIComponent(href)}`;
      return `<a ${before}href="${redirect}"${after} target="_blank" rel="noopener noreferrer">`;
    }
  );

  if (!tracked.includes("</body>")) {
    tracked += pixel;
  } else {
    tracked = tracked.replace("</body>", `${pixel}</body>`);
  }

  return tracked;
}

/** Appends the compliance footer required on every outbound campaign email. */
export function appendComplianceFooter(
  html: string,
  token: string,
  senderCompany: string | null
): string {
  const footer = `
  <div style="margin-top:28px;padding-top:16px;border-top:1px solid #e5e5e5;font-size:12px;line-height:1.5;color:#737373;">
    <p style="margin:0 0 8px;">${senderCompany ?? "Cosmora"}</p>
    <p style="margin:0;">
      You are receiving this because you opted in to receive business communications.
      <a href="${buildUnsubscribeUrl(token)}" style="color:#737373;text-decoration:underline;">Unsubscribe</a>
    </p>
  </div>`;

  if (!html.includes("</body>")) {
    return `${html}${footer}`;
  }

  return html.replace("</body>", `${footer}</body>`);
}

/** Best-effort plain-text alternative for a HTML body. */
export function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h1|h2|h3|h4|li)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}