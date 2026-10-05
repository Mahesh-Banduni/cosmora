import { chatCompletion, extractJson, type ChatMessage } from "@/lib/ai";
import type { Icp } from "@/lib/generated/prisma/client";

export type ParsedRequirements = {
  naturalLanguageRequirements: string;
  industries: string[];
  countries: string[];
  states: string[];
  cities: string[];
  jobTitles: string[];
  technologies: string[];
  keywords: string[];
  exclusions: string[];
  sizeMin: number | null;
  sizeMax: number | null;
  revenueMin: number | null;
  revenueMax: number | null;
  icpName: string;
  description: string;
};

const emptyRequirements = (text: string): ParsedRequirements => ({
  naturalLanguageRequirements: text,
  industries: [],
  countries: [],
  states: [],
  cities: [],
  jobTitles: [],
  technologies: [],
  keywords: [],
  exclusions: [],
  sizeMin: null,
  sizeMax: null,
  revenueMin: null,
  revenueMax: null,
  icpName: "New ICP",
  description: "",
});

/**
 * Converts a free-text ICP description into structured database filters.
 * Falls back to the raw text when no AI key is configured so the ICP form
 * stays usable without a provider.
 */
export async function parseNaturalLanguageRequirements(
  text: string
): Promise<ParsedRequirements> {
  if (!text.trim()) return emptyRequirements(text);

  const messages: ChatMessage[] = [
    {
          role: "system",
          content:
            "You convert a sales team's ideal-customer-profile description into structured lead-database filters. " +
        "Reply with JSON only. Use canonical, capitalized values. Use null for unknown numeric bounds. " +
        "Put explicit 'not', 'exclude', or 'avoid' criteria into `exclusions`.",
    },
    {
      role: "user",
      content:
        `Description:\n"""\n${text}\n"""\n\n` +
        'Return JSON with keys: icpName (short string), description (one sentence), ' +
        "naturalLanguageRequirements (the original text), " +
        "industries, countries, states, cities, jobTitles, technologies, keywords, exclusions " +
        "(each an array of strings, [] when unknown), " +
        "sizeMin, sizeMax, revenueMin, revenueMax (numbers or null). " +
        "Company size and revenue bounds refer to the company, not the contact.",
    },
  ];

  try {
    const raw = await chatCompletion(messages, { json: true, temperature: 0 });
    const parsed = extractJson<Partial<ParsedRequirements>>(raw);

    const asStrings = (value: unknown): string[] =>
      Array.isArray(value)
        ? value.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        : [];

    const asNumber = (value: unknown): number | null =>
      typeof value === "number" && Number.isFinite(value) ? value : null;

    return {
      naturalLanguageRequirements: text,
      icpName: typeof parsed.icpName === "string" && parsed.icpName ? parsed.icpName : "New ICP",
      description: typeof parsed.description === "string" ? parsed.description : "",
      industries: asStrings(parsed.industries),
      countries: asStrings(parsed.countries),
      states: asStrings(parsed.states),
      cities: asStrings(parsed.cities),
      jobTitles: asStrings(parsed.jobTitles),
      technologies: asStrings(parsed.technologies),
      keywords: asStrings(parsed.keywords),
      exclusions: asStrings(parsed.exclusions),
      sizeMin: asNumber(parsed.sizeMin),
      sizeMax: asNumber(parsed.sizeMax),
      revenueMin: asNumber(parsed.revenueMin),
      revenueMax: asNumber(parsed.revenueMax),
    };
  } catch {
    return emptyRequirements(text);
  }
}

/**
 * Produces a plain-language justification for an ICP match score.
 */
export async function explainLeadScore(
  icp: Pick<Icp, "name" | "industries" | "jobTitles" | "technologies">,
  company: {
    name: string;
    industry: string | null;
    employeeCount: number | null;
    country: string | null;
    technologies: string[];
  },
  contact: { jobTitle: string | null } | null,
  score: number,
  matchedCriteria: string[]
): Promise<string> {
  if (!process.env.AI_API_KEY) {
    return (
      `Scored ${score}/100 against "${icp.name}". ` +
      (matchedCriteria.length > 0
        ? `Matched on: ${matchedCriteria.join(", ")}.`
        : "No configured criteria matched.")
    );
  }

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You explain lead-qualification scores to sales reps in two or three short sentences. " +
        "Be concrete, cite the fields that drove the score, and flag the weakest dimension. No preamble.",
    },
    {
      role: "user",
      content: [
        `ICP "${icp.name}" targets:`,
        `- industries: ${icp.industries.join(", ") || "any"}`,
        `- job titles: ${icp.jobTitles.join(", ") || "any"}`,
        `- technologies: ${icp.technologies.join(", ") || "any"}`,
        `Company: ${company.name}`,
        `- industry: ${company.industry ?? "unknown"}`,
        `- employees: ${company.employeeCount ?? "unknown"}`,
        `- country: ${company.country ?? "unknown"}`,
        `- technologies: ${company.technologies.join(", ") || "unknown"}`,
        `Contact job title: ${contact?.jobTitle ?? "unknown"}`,
        `Match score: ${score}/100`,
        `Criteria matched: ${matchedCriteria.join(", ") || "none"}`,
      ].join("\n"),
    },
  ];

  try {
    return (await chatCompletion(messages, { temperature: 0.3, maxTokens: 220 })).trim();
  } catch {
    return (
      `Scored ${score}/100 against "${icp.name}". ` +
      (matchedCriteria.length > 0
        ? `Matched on: ${matchedCriteria.join(", ")}.`
        : "No configured criteria matched.")
    );
  }
}

/* ==========================================================================
   Email generation
   ========================================================================== */

export type GeneratedEmail = {
  subject: string;
  previewText: string;
  bodyHtml: string;
  cta: string;
};

export async function generateEmail(params: {
  productOrService: string;
  valueProposition: string;
  tone: string;
  audience: string;
  callToAction: string;
  senderName: string;
  companyName: string;
  instructions?: string;
}): Promise<GeneratedEmail> {
  const messages: ChatMessage[] = [
    {
          role: "system",
          content:
            "You write concise B2B cold-outreach emails. Reply with JSON only: {subject, previewText, cta, bodyHtml}. " +
        "bodyHtml must be table-based, inline-styled, email-client-safe HTML with no <script>, no external CSS, and no <style> block. " +
        "Keep it under 140 words. Use the merge tokens {{firstName}}, {{company}}, and {{senderName}} where they read naturally.",
    },
    {
      role: "user",
      content: [
        `Offering: ${params.productOrService}`,
        `Value proposition: ${params.valueProposition}`,
        `Audience: ${params.audience}`,
        `Tone: ${params.tone}`,
        `Call to action: ${params.callToAction}`,
        `Sender: ${params.senderName} at ${params.companyName}`,
        params.instructions ? `Extra instructions: ${params.instructions}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];

  const raw = await chatCompletion(messages, {
    json: true,
    temperature: 0.7,
    maxTokens: 1200,
  });

  const parsed = extractJson<Partial<GeneratedEmail>>(raw);

  return {
    subject: parsed.subject?.trim() || "A quick idea for your team",
    previewText: parsed.previewText?.trim() || "",
    cta: parsed.cta?.trim() || params.callToAction,
    bodyHtml: parsed.bodyHtml?.trim() || "<p>Hello {{firstName}},</p>",
  };
}