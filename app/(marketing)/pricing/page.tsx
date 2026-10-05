import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ArrowRight, Sparkles } from "lucide-react";
import { MarketingShell } from "@/app/components/marketing/MarketingShell";
import {
  PageHero,
  SectionHeading,
  MarketingImage,
  ClosingCta,
} from "@/app/components/marketing/Marketing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Cosmora pricing — a free plan to get started, credit packs for unlocking leads, and a team plan with shared SMTP and compliance controls.",
};

type Plan = {
  name: string;
  tagline: string;
  price: string;
  period: string;
  featured?: boolean;
  cta: { href: string; label: string };
  features: string[];
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    tagline: "For one rep validating a segment.",
    price: "$0",
    period: "forever",
    cta: { href: "/register", label: "Create free account" },
    features: [
      "1 active ICP",
      "25 saved leads",
      "1 connected SMTP account",
      "AI email drafts",
      "Basic delivery analytics",
      "Community support",
    ],
  },
  {
    name: "Growth",
    tagline: "For reps running live outbound.",
    price: "$49",
    period: "per seat / month",
    featured: true,
    cta: { href: "/register", label: "Start with Growth" },
    features: [
      "Unlimited ICPs",
      "Unlimited saved leads",
      "5 connected SMTP accounts",
      "Full email builder and raw HTML",
      "Advanced analytics and per-contact tracking",
      "Priority support",
    ],
  },
  {
    name: "Team",
    tagline: "For teams sharing a sending setup.",
    price: "Custom",
    period: "annual agreement",
    cta: { href: "/contact", label: "Talk to us" },
    features: [
      "Everything in Growth",
      "Unlimited SMTP accounts",
      "Shared suppression list",
      "Admin compliance controls",
      "Audit log access",
      "Onboarding and migration help",
    ],
  },
];

const CREDIT_PACKS = [
  { name: "Starter pack", credits: "100 credits", price: "$19" },
  { name: "Growth pack", credits: "500 credits", price: "$79", badge: "Popular" },
  { name: "Scale pack", credits: "2,500 credits", price: "$299" },
];

const COMPARISON: { feature: string; starter: boolean; growth: boolean; team: boolean }[] = [
  { feature: "Active ICPs", starter: true, growth: true, team: true },
  { feature: "Saved leads", starter: false, growth: true, team: true },
  { feature: "Connected SMTP accounts", starter: false, growth: true, team: true },
  { feature: "AI email drafts", starter: true, growth: true, team: true },
  { feature: "Visual email builder", starter: false, growth: true, team: true },
  { feature: "Raw HTML import", starter: false, growth: true, team: true },
  { feature: "Per-contact open and click tracking", starter: false, growth: true, team: true },
  { feature: "Shared suppression list", starter: false, growth: false, team: true },
  { feature: "Admin compliance controls", starter: false, growth: false, team: true },
  { feature: "Audit log", starter: false, growth: false, team: true },
];

function Cell({ on }: { on: boolean }) {
  return on ? (
    <Check size={16} aria-label="Included" className="text-[var(--success)]" />
  ) : (
    <Minus size={16} aria-label="Not included" className="text-[var(--text-muted)]" />
  );
}

export default function PricingPage() {
  return (
    <MarketingShell active="/pricing">
      <PageHero
        eyebrow="Pricing"
        title="Credits for leads, seats for people"
        description="Cosmora is free to start. Pay for credits when you want to unlock contact details, and add seats as more people start sending."
      />

      {/* Plans */}
      <section className="section-container section-padding">
        <div className="grid gap-scale-md-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col gap-scale-md-6 rounded-[var(--radius-2xl)] border p-scale-md-7 ${
                plan.featured
                  ? "border-[var(--brand)] bg-[var(--card)] shadow-[var(--shadow-lg)]"
                  : "border-[var(--border)] bg-[var(--card)]"
              }`}
            >
              <div className="flex flex-col gap-scale-sm-2">
                <div className="flex items-center justify-between gap-scale-sm-3">
                  <h2 className="h5">{plan.name}</h2>
                  {plan.featured ? (
                    <span className="rounded-full bg-[var(--bg-2)] px-scale-sm-3 py-scale-sm-1 para-text-xxs font-semibold uppercase tracking-wider text-[var(--text-neutral)]">
                      Most popular
                    </span>
                  ) : null}
                </div>
                <p className="para-text-sm text-[var(--text-secondary)]">
                  {plan.tagline}
                </p>
              </div>

              <div className="flex items-baseline gap-scale-sm-2">
                <span className="text-[40px] font-semibold leading-none tracking-[-0.03em] text-[var(--text-primary)]">
                  {plan.price}
                </span>
                <span className="para-text-xs text-[var(--text-muted)]">
                  {plan.period}
                </span>
              </div>

              <Link
                href={plan.cta.href}
                className={`inline-flex h-10 w-full items-center justify-center rounded-[var(--radius-button)] para-text-sm font-medium transition-colors ${
                  plan.featured
                    ? "bg-[var(--brand)] text-[var(--brand-foreground)] hover:bg-[color-mix(in_srgb,var(--brand)_88%,white)]"
                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {plan.cta.label}
              </Link>

              <ul className="flex flex-col gap-scale-sm-3 border-t border-[var(--border)] pt-scale-md-5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-scale-sm-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] [&>svg]:size-3"
                    >
                      <Check />
                    </span>
                    <span className="para-text-sm text-[var(--text-secondary)]">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="para-text-xs mt-scale-md-6 text-[var(--text-muted)]">
          Prices are in USD and exclude applicable taxes. Annual billing is
          available on Growth and Team.
        </p>
      </section>

      {/* Credits */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] section-padding">
        <div className="section-container flex flex-col gap-scale-lg-10">
          <div className="grid items-end gap-scale-lg-10 lg:grid-cols-2">
            <SectionHeading
              eyebrow="Credits"
              title="Credits unlock contact details"
              description="Matching is always free, so you can qualify a whole segment before spending anything. A credit is only spent when you reveal a lead's contact details, and every transaction is recorded in your ledger."
            />

            <MarketingImage
              src="/images/marketing/credits-planning.jpg"
              alt="Business planning with budget notes and documents"
              ratio="16/10"
            />
          </div>

          <ul className="grid gap-scale-md-6 md:grid-cols-3">
            {CREDIT_PACKS.map((pack) => (
              <li
                key={pack.name}
                className="flex flex-col gap-scale-sm-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-scale-md-6"
              >
                <div className="flex items-center justify-between gap-scale-sm-3">
                  <h3 className="h6">{pack.name}</h3>
                  {pack.badge ? (
                    <span className="rounded-full border border-[var(--border)] bg-[var(--muted)] px-scale-sm-2 py-scale-sm-1 para-text-xxs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      {pack.badge}
                    </span>
                  ) : null}
                </div>
                <span className="para-text-sm text-[var(--text-secondary)]">
                  {pack.credits}
                </span>
                <span className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-[var(--text-primary)]">
                  {pack.price}
                </span>
                <span className="para-text-xxs text-[var(--text-muted)]">
                  One-time purchase — credits do not expire
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Comparison */}
      <section className="section-container section-padding">
        <div className="flex flex-col gap-scale-lg-10">
          <SectionHeading
            eyebrow="Compare"
            title="What is included in each plan"
            description="The short version. Anything not listed here is the same product and the same behaviour across plans."
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th scope="col" className="py-scale-sm-3 pr-scale-md-4 para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    Feature
                  </th>
                  <th scope="col" className="px-scale-md-4 py-scale-sm-3 para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    Starter
                  </th>
                  <th scope="col" className="px-scale-md-4 py-scale-sm-3 para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    Growth
                  </th>
                  <th scope="col" className="px-scale-md-4 py-scale-sm-3 para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    Team
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="border-b border-[var(--border)] last:border-0">
                    <th
                      scope="row"
                      className="py-scale-sm-4 pr-scale-md-4 para-text-sm font-normal text-[var(--text-primary)]"
                    >
                      {row.feature}
                    </th>
                    <td className="px-scale-md-4 py-scale-sm-4">
                      <Cell on={row.starter} />
                    </td>
                    <td className="px-scale-md-4 py-scale-sm-4">
                      <Cell on={row.growth} />
                    </td>
                    <td className="px-scale-md-4 py-scale-sm-4">
                      <Cell on={row.team} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-scale-sm-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)] p-scale-md-5">
            <Sparkles size={18} aria-hidden className="text-[var(--text-secondary)]" />
            <p className="para-text-sm text-[var(--text-secondary)]">
              Need credits at volume, or an on-premise deployment?{" "}
              <Link
                href="/contact"
                className="font-medium text-[var(--text-primary)] underline underline-offset-4"
              >
                Talk to us
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="border-t border-[var(--border)] bg-[var(--card)] section-padding">
        <div className="section-container">
          <div className="grid items-center gap-scale-lg-10 lg:grid-cols-2">
            <MarketingImage
              src="/images/marketing/handshake-agreement.jpg"
              alt="Two people shaking hands in agreement"
              ratio="4/3"
            />

            <div className="flex flex-col gap-scale-md-5">
              <SectionHeading
                eyebrow="Fair use"
                title="Your credits, your sending reputation"
                description="We do not resell your contact data, we do not send on your behalf from shared infrastructure, and we do not lock you out of the leads you have paid to unlock."
              />
              <ul className="flex flex-col gap-scale-sm-3">
                {[
                  "Credits are spent only when you choose to unlock a lead.",
                  "Matching and scoring are never rate-limited by credits.",
                  "Changing plan never removes data you have already unlocked.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-scale-sm-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] [&>svg]:size-3"
                    >
                      <Check />
                    </span>
                    <span className="para-text-sm text-[var(--text-secondary)]">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-flex w-fit items-center gap-2 para-text-sm font-medium text-[var(--text-primary)] underline underline-offset-4"
              >
                Start free, upgrade later
                <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        title="Start on the free plan"
        description="Match a segment, see the quality of the results, and only then decide whether to spend credits."
        primary={{ href: "/register", label: "Create free account" }}
        secondary={{ href: "/faq", label: "Read the FAQ" }}
      />
    </MarketingShell>
  );
}