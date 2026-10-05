import type { Metadata } from "next";
import { MarketingShell } from "@/app/components/marketing/MarketingShell";
import { PageHero, MarketingImage } from "@/app/components/marketing/Marketing";
import { FaqAccordion, type FaqGroup } from "@/app/components/marketing/FaqAccordion";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about Cosmora credits, AI lead matching, SMTP sending, deliverability guardrails, tracking and compliance.",
};

const GROUPS: FaqGroup[] = [
  {
    id: "getting-started",
    title: "Getting started",
    items: [
      {
        q: "What do I need to send my first campaign?",
        a: "An account, one connected SMTP account, and at least one ICP with at least one unlocked lead. Cosmora never sends from its own infrastructure, so the SMTP account is on you — any provider that supports authenticated sending works.",
      },
      {
        q: "How do credits work?",
        a: "Matching and scoring are free and unlimited. A credit is spent only when you choose to unlock a lead's contact details. Every credit transaction is recorded in your ledger with the balance after each one.",
      },
      {
        q: "Do credits expire?",
        a: "No. Credit packs are a one-time purchase and do not expire, so there is no pressure to use them before they are gone.",
      },
      {
        q: "Who manages the lead database?",
        a: "Administrators. They import companies and contacts from CSV or Excel, resolve duplicates, and decide which records users are allowed to match against. Users describe and search; admins curate the source data.",
      },
    ],
  },
  {
    id: "matching",
    title: "Matching and leads",
    items: [
      {
        q: "How does AI matching decide what to show me?",
        a: "You describe your ideal customer in plain English. AI converts that into filters, then every candidate is filtered and scored with a weighted rubric. The reasons behind each score are shown so you can judge the result rather than trust it.",
      },
      {
        q: "Are my exclusions actually enforced?",
        a: "Yes. Exclusions are applied inside the database query, not as a post-filter on the interface. No caller can bypass them, so a lead you excluded will not appear even if it scores highly.",
      },
      {
        q: "Can I see contact details before spending a credit?",
        a: "No. Contact details are hidden unless a lead's availability is unlocked, which only happens after a credit transaction succeeds. The permission is re-checked on every read, not just when the page first loads.",
      },
      {
        q: "What happens to leads I have unlocked if I change plan?",
        a: "Nothing. Unlocked data stays unlocked. Plan changes affect limits going forward and never remove data you have already paid for.",
      },
    ],
  },
  {
    id: "sending",
    title: "Email and sending",
    items: [
      {
        q: "What are the three ways to write an email?",
        a: "Generate a first draft with AI, compose visually using a block builder, or paste raw HTML for a template you maintain elsewhere. All three support merge tokens and a live preview.",
      },
      {
        q: "Does Cosmora send from its own servers?",
        a: "No. Every campaign is sent through an SMTP account you connect. Credentials are encrypted at rest and used only against that account, which means your sending reputation stays yours.",
      },
      {
        q: "How does Cosmora avoid deliverability problems?",
        a: "Daily send limits are enforced before a message is queued, an inter-send delay keeps the pattern human, and transient failures are retried. Hard bounces and unsubscribes are re-checked at send time and auto-suppress the address going forward.",
      },
      {
        q: "Can I pause or stop a campaign?",
        a: "Yes. Campaigns can be paused, resumed and cancelled. What has already been sent cannot be recalled, so pause before a campaign gets ahead of itself.",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics and compliance",
    items: [
      {
        q: "What is tracked per email?",
        a: "Opens, clicks, delivery, bounces, replies and unsubscribes — per campaign and per contact. Each message carries an open pixel and a click redirect keyed to a tracking token, so events are attributable to a single recipient.",
      },
      {
        q: "Do you add an unsubscribe link?",
        a: "Yes, a compliance footer with an unsubscribe link is included on outbound email. Unsubscribing adds the address to the suppression list, and it is re-checked at send time.",
      },
      {
        q: "What is the audit log for?",
        a: "Administrative actions. User management, lead imports, category changes and compliance decisions are recorded so there is a record of who changed what.",
      },
      {
        q: "How do I get help?",
        a: "Use the contact page. Growth includes priority support, Team includes onboarding help, and the free plan is supported through the same channel.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <MarketingShell active="/faq">
      <PageHero
        eyebrow="FAQ"
        title="Questions we get asked most"
        description="If something here does not cover your case, the contact page reaches a real person rather than a form that goes nowhere."
      />

      <section className="section-container section-padding">
        <div className="grid gap-scale-lg-10 lg:grid-cols-[1.5fr_1fr]">
          <FaqAccordion groups={GROUPS} />

          <aside className="flex flex-col gap-scale-md-6 lg:sticky lg:top-24 lg:self-start">
            <MarketingImage
              src="/images/marketing/support-conversation.jpg"
              alt="Support conversation over a laptop"
              ratio="4/3"
            />

            <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--muted)] p-scale-md-6">
              <h2 className="h6">Still stuck?</h2>
              <p className="para-text-sm mt-scale-sm-3 text-[var(--text-secondary)]">
                Send us the question and a real person will answer. Bug reports
                are especially welcome.
              </p>
              <a
                href="/contact"
                className="mt-scale-md-5 inline-flex h-10 items-center justify-center rounded-[var(--radius-button)] bg-[var(--brand)] px-scale-md-4 para-text-sm font-medium text-[var(--brand-foreground)] transition-colors hover:bg-[color-mix(in_srgb,var(--brand)_88%,white)]"
              >
                Contact support
              </a>
            </div>
          </aside>
        </div>
      </section>
    </MarketingShell>
  );
}