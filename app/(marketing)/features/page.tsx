import type { Metadata } from "next";
import Link from "next/link";
import {
  Database,
  Sparkles,
  Target,
  Mail,
  ShieldCheck,
  BarChart3,
  Lock,
  Gauge,
  Tags,
  ArrowRight,
  Check,
} from "lucide-react";
import { MarketingShell } from "@/app/components/marketing/MarketingShell";
import {
  PageHero,
  SectionHeading,
  MarketingImage,
  ClosingCta,
} from "@/app/components/marketing/Marketing";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Lead database management, AI ICP matching, credit-based unlocking, three email creation modes, your own SMTP and delivery analytics — everything Cosmora does.",
};

const CAPABILITIES = [
  {
    icon: Database,
    title: "Admin lead database",
    body: "Companies and contacts are managed centrally and imported from CSV or Excel with duplicate detection and field validation. Admins decide which records users may match against.",
  },
  {
    icon: Sparkles,
    title: "Natural-language ICP",
    body: "Describe the customer you want in plain English. AI converts the description into filters for industry, geography, size, revenue, job titles, technologies and keywords.",
  },
  {
    icon: Target,
    title: "Scored matches",
    body: "Every candidate is scored with a weighted rubric and the reasons are surfaced, so a rep can see exactly why a lead ranked where it did instead of trusting a black box.",
  },
  {
    icon: Lock,
    title: "Credit-based unlocking",
    body: "Matched leads show a summary. Credits are spent to reveal full contact details, and availability is only set after the transaction succeeds — enforced server-side on every read.",
  },
  {
    icon: Mail,
    title: "Three ways to write",
    body: "Generate a first draft with AI, compose visually with a block builder, or paste raw HTML. All three support merge tokens and a live preview.",
  },
  {
    icon: ShieldCheck,
    title: "Your own SMTP",
    body: "Connect multiple sending accounts with credentials encrypted at rest, then schedule, pause and throttle real sends from infrastructure you control.",
  },
];

const EMAIL_MODES = [
  {
    icon: Sparkles,
    title: "AI draft",
    body: "Describe the angle and the tone. AI produces a personalised first draft you can edit before anything is queued.",
  },
  {
    icon: Mail,
    title: "Visual builder",
    body: "Assemble the email from blocks — headings, text, buttons, dividers — with live preview and inline editing.",
  },
  {
    icon: Database,
    title: "Raw HTML",
    body: "Paste markup for full control over a template you already maintain elsewhere.",
  },
];

const DELIVERY_GUARDS = [
  {
    icon: Gauge,
    title: "Daily send limits",
    body: "Per-account caps are enforced before a message enters the queue, so a misconfigured campaign cannot flood a domain.",
  },
  {
    icon: Gauge,
    title: "Inter-send delay",
    body: "A configurable gap between sends keeps delivery patterns human rather than bursty.",
  },
  {
    icon: Tags,
    title: "Suppression list",
    body: "Unsubscribes and hard bounces are re-checked at send time, not just at queue time, and auto-suppress the address going forward.",
  },
  {
    icon: BarChart3,
    title: "Per-contact tracking",
    body: "Every message carries an open pixel and a click redirect keyed to a tracking token, plus an unsubscribe footer.",
  },
];

const ANALYTICS_ROWS = [
  "Sent",
  "Delivered",
  "Bounced",
  "Opened",
  "Clicked",
  "Replied",
  "Unsubscribed",
];

export default function FeaturesPage() {
  return (
    <MarketingShell active="/features">
      <PageHero
        eyebrow="Features"
        title="Everything between the spreadsheet and the sent folder"
        description="Cosmora covers the full outbound loop: a curated lead database, AI matching and scoring, credit-gated contact access, email creation, real sending, and the analytics to prove it worked."
      >
        <Link href="/register">
          <span className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--brand)] px-5 para-text-sm font-medium text-[var(--brand-foreground)] transition-colors hover:bg-[color-mix(in_srgb,var(--brand)_88%,white)]">
            Start matching leads
            <ArrowRight size={16} aria-hidden />
          </span>
        </Link>
        <Link href="/pricing">
          <span className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] border border-[var(--border)] bg-[var(--surface)] px-5 para-text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]">
            See pricing
          </span>
        </Link>
      </PageHero>

      {/* Capability grid */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] section-padding">
        <div className="section-container flex flex-col gap-scale-lg-10">
          <SectionHeading
            eyebrow="Capabilities"
            title="Built for reps who send real email"
            description="Each capability maps to a screen in the product, with the controls you would expect from a production sending tool."
          />

          <ul className="grid gap-scale-md-6 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((item) => (
              <li
                key={item.title}
                className="flex flex-col gap-scale-sm-3 rounded-[var(--radius-lg)] border border-[var(--border)] p-5"
              >
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--muted)] text-[var(--text-primary)] [&>svg]:size-[18px]"
                >
                  <item.icon />
                </span>
                <h3 className="h6">{item.title}</h3>
                <p className="para-text-sm text-[var(--text-secondary)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Matching, split with image */}
      <section className="section-container section-padding">
        <div className="grid items-center gap-scale-lg-10 lg:grid-cols-2">
          <MarketingImage
            src="/images/marketing/matching-analytics.jpg"
            alt="Analytics dashboard showing lead matching performance charts"
            ratio="4/3"
            priority
          />

          <div className="flex flex-col gap-scale-md-5">
            <SectionHeading
              eyebrow="Matching"
              title="Describe the customer. Get a ranked list."
              description="An ICP in Cosmora is not a static filter set — it is the thing you actually care about, written the way you would brief a colleague."
            />
            <ul className="flex flex-col gap-scale-sm-4">
              {[
                "Match on industry, geography, company size, revenue, job titles, technologies and keywords.",
                "Exclusions are applied inside the database query, so no caller can bypass them.",
                "Each result carries a score and the reasons behind it.",
                "Save leads to your own list and unlock contact details when you are ready.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-scale-sm-3">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--text-primary)] [&>svg]:size-3"
                  >
                    <Check />
                  </span>
                  <span className="para-text-sm text-[var(--text-secondary)]">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Email creation */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] section-padding">
        <div className="section-container flex flex-col gap-scale-lg-10">
          <div className="grid items-center gap-scale-lg-10 lg:grid-cols-2">
            <div className="flex flex-col gap-scale-md-5 lg:order-2">
              <SectionHeading
                eyebrow="Writing"
                title="Three ways to write the same email"
                description="Start from AI, build visually, or paste the markup you already trust. Merge tokens and live preview work the same in all three."
              />
            </div>

            <MarketingImage
              src="/images/marketing/email-composing.jpg"
              alt="Laptop screen with an email being composed"
              ratio="4/3"
              className="lg:order-1"
            />
          </div>

          <ul className="grid gap-scale-md-6 md:grid-cols-3">
            {EMAIL_MODES.map((mode) => (
              <li
                key={mode.title}
                className="flex flex-col gap-scale-sm-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <span
                  aria-hidden
                  className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-2)] text-[var(--text-neutral)] [&>svg]:size-4"
                >
                  <mode.icon />
                </span>
                <h3 className="h6">{mode.title}</h3>
                <p className="para-text-sm text-[var(--text-secondary)]">
                  {mode.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Delivery */}
      <section className="section-container section-padding">
        <div className="grid items-center gap-scale-lg-10 lg:grid-cols-2">
          <div className="flex flex-col gap-scale-md-5">
            <SectionHeading
              eyebrow="Delivery"
              title="Sending that respects your domain"
              description="Cosmora never sends from a shared inbox. Your credentials, your limits, your reputation — with the guardrails that keep a campaign from going wrong."
            />
            <ul className="flex flex-col gap-scale-sm-4">
              {DELIVERY_GUARDS.map((guard) => (
                <li key={guard.title} className="flex gap-scale-sm-3">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--muted)] text-[var(--text-secondary)] [&>svg]:size-4"
                  >
                    <guard.icon />
                  </span>
                  <div className="flex flex-col gap-scale-sm-1">
                    <h3 className="h7">{guard.title}</h3>
                    <p className="para-text-sm text-[var(--text-secondary)]">
                      {guard.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <MarketingImage
            src="/images/marketing/campaign-results.jpg"
            alt="Two colleagues reviewing campaign results together"
            ratio="4/3"
          />
        </div>
      </section>

      {/* Analytics */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] section-padding">
        <div className="section-container flex flex-col gap-scale-lg-10">
          <div className="grid items-center gap-scale-lg-10 lg:grid-cols-2">
            <MarketingImage
              src="/images/marketing/analytics-monitors.jpg"
              alt="Business analytics charts on a monitor"
              ratio="4/3"
            />

            <div className="flex flex-col gap-scale-md-5">
              <SectionHeading
                eyebrow="Analytics"
                title="Every event, per campaign and per contact"
                description="Opens and clicks are tracked per message, so you can tell which subject line and which sender actually earned a reply."
              />

              <ul className="flex flex-wrap gap-scale-sm-2">
                {ANALYTICS_ROWS.map((row) => (
                  <li
                    key={row}
                    className="rounded-full border border-[var(--border)] bg-[var(--muted)] px-scale-sm-3 py-scale-sm-2 para-text-xs font-medium text-[var(--text-secondary)]"
                  >
                    {row}
                  </li>
                ))}
              </ul>

              <p className="para-text-sm text-[var(--text-secondary)]">
                Hard bounces are auto-suppressed, and every admin action is written
                to an audit log you can review later.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        title="See it against your own data"
        description="Create an account, describe your ICP, and match it against the lead database in a few minutes. No sales call required."
        primary={{ href: "/register", label: "Create free account" }}
        secondary={{ href: "/pricing", label: "View pricing" }}
      />
    </MarketingShell>
  );
}