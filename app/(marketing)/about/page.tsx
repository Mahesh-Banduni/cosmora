import type { Metadata } from "next";
import Link from "next/link";
import { Target, Users, ShieldCheck, Zap } from "lucide-react";
import { MarketingShell } from "@/app/components/marketing/MarketingShell";
import {
  PageHero,
  SectionHeading,
  MarketingImage,
} from "@/app/components/marketing/Marketing";

export const metadata: Metadata = {
  title: "About",
  description:
    "Cosmora exists because outbound should not require a shared inbox. Learn how we think about lead data, sending infrastructure and honest matching.",
};

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Your infrastructure stays yours",
    body: "We never ask for a password we can send from. Credentials are encrypted at rest and used only against the account you connect.",
  },
  {
    icon: Target,
    title: "Honest matching",
    body: "Scores are explainable and exclusions are enforced in the query. A lead that should not surface cannot surface.",
  },
  {
    icon: Users,
    title: "Reps first",
    body: "Every screen is designed around the rep who has to hit a number, not the admin who has to approve a tool.",
  },
  {
    icon: Zap,
    title: "Boring where it counts",
    body: "Queueing, retries, suppression and rate limits are the parts nobody demos. We treat them as the product.",
  },
];

const TIMELINE = [
  {
    year: "Day one",
    title: "A spreadsheet and a shared inbox",
    body: "The problem that started it: buying a lead list, pasting it into a mail merge, and hoping the domain survived.",
  },
  {
    year: "V1",
    title: "Matching and sending, properly",
    body: "Admin-managed lead data, natural-language ICPs, scored matches, credit-gated contact access and real sending through user SMTP.",
  },
  {
    year: "Next",
    title: "Closer to the conversation",
    body: "Follow-up sequences, reply handling, and attribution that connects outreach to revenue rather than to opens.",
  },
];

const TEAM = [
  { name: "Product and engineering", body: "Design, build and ship the product end to end." },
  { name: "Data operations", body: "Curate the lead database and keep it clean." },
  { name: "Support", body: "Help reps get their sending setup working." },
];

export default function AboutPage() {
  return (
    <MarketingShell active="/about">
      <PageHero
        eyebrow="About"
        title="Outbound should not need a shared inbox"
        description="Cosmora is a focused first release: a curated lead database, matching that explains itself, and email you send from your own SMTP. We would rather do a few things properly than claim everything."
      />

      {/* Story */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] section-padding">
        <div className="section-container">
          <div className="grid items-center gap-scale-lg-10 lg:grid-cols-2">
            <div className="flex flex-col gap-scale-md-5">
              <SectionHeading
                eyebrow="Why we built it"
                title="Lead tools got complicated. Sending got risky."
                description="Most of the category splits into two halves: a database tool that tells you who to contact, and a sending tool that asks for your credentials and starts delivering from somewhere you cannot see."
              />
              <div className="flex flex-col gap-scale-sm-4 para-text-md text-[var(--text-secondary)]">
                <p>
                  The first half is fine. The second half is where teams lose
                  control — shared sending infrastructure, sudden throttling, and
                  no clear answer about what happened to a specific contact.
                </p>
                <p>
                  Cosmora joins the two but keeps the boundary firm: we help you
                  find and write the right email, and you keep the sending.
                </p>
              </div>
            </div>

            <MarketingImage
              src="/images/marketing/team-collaboration.jpg"
              alt="A team collaborating around a table"
              ratio="4/3"
              priority
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-container section-padding">
        <div className="flex flex-col gap-scale-lg-10">
          <SectionHeading
            eyebrow="Principles"
            title="Four things we will not trade away"
            description="These are the constraints that shaped the product, stated plainly so you can hold us to them."
          />

          <ul className="grid gap-scale-md-6 sm:grid-cols-2">
            {VALUES.map((value) => (
              <li
                key={value.title}
                className="flex flex-col gap-scale-sm-3 rounded-[var(--radius-lg)] border border-[var(--border)] p-scale-md-6"
              >
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--muted)] text-[var(--text-primary)] [&>svg]:size-[18px]"
                >
                  <value.icon />
                </span>
                <h3 className="h6">{value.title}</h3>
                <p className="para-text-sm text-[var(--text-secondary)]">
                  {value.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Journey */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] section-padding">
        <div className="section-container">
          <div className="grid items-center gap-scale-lg-10 lg:grid-cols-2">
            <MarketingImage
              src="/images/marketing/planning-whiteboard.jpg"
              alt="A team reviewing a plan on a whiteboard"
              ratio="4/3"
            />

            <div className="flex flex-col gap-scale-md-6">
              <SectionHeading
                eyebrow="Trajectory"
                title="Where this is going"
                description="V1 is deliberately narrow. These are the next pieces of the loop, in the order we intend to build them."
              />

              <ol className="flex flex-col gap-scale-md-5">
                {TIMELINE.map((entry, index) => (
                  <li key={entry.year} className="flex gap-scale-md-4">
                    <div className="flex flex-col items-center">
                      <span
                        aria-hidden
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-2)] para-text-xxs font-semibold text-[var(--text-neutral)]"
                      >
                        {index + 1}
                      </span>
                      {index < TIMELINE.length - 1 ? (
                        <span
                          aria-hidden
                          className="mt-1 w-px flex-1 bg-[var(--border)]"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-scale-sm-2 pb-scale-md-2">
                      <span className="para-text-xxs uppercase tracking-widest text-[var(--text-muted)]">
                        {entry.year}
                      </span>
                      <h3 className="h6">{entry.title}</h3>
                      <p className="para-text-sm text-[var(--text-secondary)]">
                        {entry.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-container section-padding">
        <div className="grid items-center gap-scale-lg-10 lg:grid-cols-2">
          <div className="flex flex-col gap-scale-md-5">
            <SectionHeading
              eyebrow="Team"
              title="A small team, close to the work"
              description="We keep the team small and the feedback loop short. If something in the product does not help a rep send better email, it should not be there."
            />
            <ul className="flex flex-col gap-scale-sm-4">
              {TEAM.map((member) => (
                <li
                  key={member.name}
                  className="flex flex-col gap-scale-sm-1 border-l-2 border-[var(--border)] pl-scale-md-4"
                >
                  <span className="para-text-sm font-medium text-[var(--text-primary)]">
                    {member.name}
                  </span>
                  <span className="para-text-xs text-[var(--text-secondary)]">
                    {member.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <MarketingImage
            src="/images/marketing/office-colleagues.jpg"
            alt="Colleagues working together in a bright office"
            ratio="4/3"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border)] bg-[var(--card)] section-padding">
        <div className="section-container">
          <div className="grid items-center gap-scale-lg-10 lg:grid-cols-2">
            <div className="flex flex-col gap-scale-md-5">
              <h2 className="h2 max-w-[20ch]">
                Judge us on the leads you actually send to
              </h2>
              <p className="para-text-md max-w-[52ch] text-[var(--text-secondary)]">
                Create an account, describe your ICP, and look at the results
                before you spend a single credit.
              </p>
              <div className="flex flex-wrap items-center gap-scale-md-4">
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-[var(--brand)] px-5 para-text-sm font-medium text-[var(--brand-foreground)] transition-colors hover:bg-[color-mix(in_srgb,var(--brand)_88%,white)]"
                >
                  Start free
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] border border-[var(--border)] bg-[var(--surface)] px-5 para-text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]"
                >
                  Contact us
                </Link>
              </div>
            </div>

            <MarketingImage
              src="/images/marketing/business-handshake.jpg"
              alt="Business team shaking hands after a meeting"
              ratio="16/9"
            />
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}