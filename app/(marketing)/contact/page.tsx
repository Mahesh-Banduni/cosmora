import type { Metadata } from "next";
import { Mail, MessageSquare, Building2, Clock } from "lucide-react";
import { MarketingShell } from "@/app/components/marketing/MarketingShell";
import { PageHero, MarketingImage } from "@/app/components/marketing/Marketing";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the Cosmora team about lead data, sending setup, credits at volume or anything else — a real person answers.",
};

const REASONS = [
  {
    icon: MessageSquare,
    title: "Product support",
    body: "Stuck on matching, SMTP setup, or a campaign that did not send. Include the campaign name if it is a sending issue.",
    email: "support@cosmora.dev",
  },
  {
    icon: Building2,
    title: "Sales and partnerships",
    body: "Team plans, volume credits, or bringing your own database. Tell us roughly how many leads you work with.",
    email: "sales@cosmora.dev",
  },
  {
    icon: Mail,
    title: "Privacy and legal",
    body: "Data requests, unsubscribe records, or questions about how lead data is handled.",
    email: "privacy@cosmora.dev",
  },
  {
    icon: Clock,
    title: "Everything else",
    body: "Bug reports, feature requests and feedback. We read all of it and most of it ships.",
    email: "hello@cosmora.dev",
  },
];

const EXPECTATIONS = [
  "We reply within one business day, usually the same day.",
  "We will ask for your account email if the question is about your workspace — never your password.",
  "We cannot recover contact details you have not unlocked, and we will not share what you have.",
];

export default function ContactPage() {
  return (
    <MarketingShell active="/contact">
      <PageHero
        eyebrow="Contact"
        title="Talk to a person, not a funnel"
        description="Pick the channel that fits. Everything reaches the same small team, and support questions get answered by someone who has actually used the product."
      />

      <section className="section-container section-padding">
        <div className="grid gap-scale-lg-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-scale-md-6">
            <ul className="grid gap-scale-md-5 sm:grid-cols-2">
              {REASONS.map((reason) => (
                <li
                  key={reason.title}
                  className="flex flex-col gap-scale-sm-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-scale-md-6"
                >
                  <span
                    aria-hidden
                    className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--muted)] text-[var(--text-primary)] [&>svg]:size-[18px]"
                  >
                    <reason.icon />
                  </span>
                  <h2 className="h6">{reason.title}</h2>
                  <p className="para-text-sm text-[var(--text-secondary)]">
                    {reason.body}
                  </p>
                  <a
                    href={`mailto:${reason.email}`}
                    className="para-text-sm font-medium text-[var(--text-primary)] underline underline-offset-4"
                  >
                    {reason.email}
                  </a>
                </li>
              ))}
            </ul>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)] p-scale-md-6">
              <h2 className="h6" id="support">
                What to expect
              </h2>
              <ul className="mt-scale-sm-4 flex flex-col gap-scale-sm-3">
                {EXPECTATIONS.map((line) => (
                  <li key={line} className="flex items-start gap-scale-sm-3">
                    <span
                      aria-hidden
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--text-muted)]"
                    />
                    <span className="para-text-sm text-[var(--text-secondary)]">
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-scale-md-6">
              <h2 className="h6">Prefer the product?</h2>
              <p className="para-text-sm mt-scale-sm-3 text-[var(--text-secondary)]">
                Many questions are answered faster in the FAQ — especially around
                credits, matching rules and what happens when a send fails.
              </p>
              <a
                href="/faq"
                className="mt-scale-md-4 inline-flex h-10 items-center justify-center rounded-[var(--radius-button)] border border-[var(--border)] bg-[var(--surface)] px-scale-md-4 para-text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                Read the FAQ
              </a>
            </div>
          </div>

          <aside className="flex flex-col gap-scale-md-6">
            <MarketingImage
              src="/images/marketing/office-conversation.jpg"
              alt="Colleagues talking at a desk in a bright office"
              ratio="4/3"
              priority
            />

            <div className="rounded-[var(--radius-2xl)] bg-[var(--bg-2)] p-scale-md-7">
              <h2 className="h6 text-[var(--text-neutral)]">Company</h2>
              <dl className="mt-scale-sm-4 flex flex-col gap-scale-sm-4">
                <div className="flex flex-col gap-scale-sm-1">
                  <dt
                    className="para-text-xxs uppercase tracking-widest"
                    style={{ color: "color-mix(in srgb, var(--text-neutral) 58%, transparent)" }}
                  >
                    Product
                  </dt>
                  <dd className="para-text-sm text-[var(--text-neutral)]">
                    Cosmora — AI lead matching and outbound campaigns
                  </dd>
                </div>
                <div className="flex flex-col gap-scale-sm-1">
                  <dt
                    className="para-text-xxs uppercase tracking-widest"
                    style={{ color: "color-mix(in srgb, var(--text-neutral) 58%, transparent)" }}
                  >
                    Email
                  </dt>
                  <dd className="para-text-sm text-[var(--text-neutral)]">
                    hello@cosmora.dev
                  </dd>
                </div>
                <div className="flex flex-col gap-scale-sm-1">
                  <dt
                    className="para-text-xxs uppercase tracking-widest"
                    style={{ color: "color-mix(in srgb, var(--text-neutral) 58%, transparent)" }}
                  >
                    Hours
                  </dt>
                  <dd className="para-text-sm text-[var(--text-neutral)]">
                    Monday to Friday, 09:00–18:00 UTC
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </section>
    </MarketingShell>
  );
}