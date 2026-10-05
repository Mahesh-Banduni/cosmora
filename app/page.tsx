import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import Button from "@/app/components/ui/store/Button";
import {
  Database,
  Target,
  Mail,
  BarChart3,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Check,
  Quote,
} from "lucide-react";
import { SiteHeader } from "@/app/components/marketing/SiteHeader";
import { SiteFooter } from "@/app/components/marketing/SiteFooter";
import {
  MarketingImage,
  SectionHeading,
} from "@/app/components/marketing/Marketing";

const FEATURES = [
  {
    icon: Database,
    title: "Admin lead database",
    body: "Companies and contacts managed centrally, imported from CSV or Excel with duplicate detection and validation.",
  },
  {
    icon: Sparkles,
    title: "Natural-language ICP",
    body: "Describe the customer you want in plain English. AI converts it into filters and scores every match.",
  },
  {
    icon: Target,
    title: "Credit-based unlocking",
    body: "Users see matching leads, then spend credits to reveal full contact details. Permissions are enforced server-side.",
  },
  {
    icon: Mail,
    title: "Three ways to write",
    body: "Generate with AI, compose visually with blocks, or paste raw HTML — with merge tokens and live preview.",
  },
  {
    icon: ShieldCheck,
    title: "Your own SMTP",
    body: "Connect multiple accounts with encrypted credentials, then schedule, pause and throttle real sending.",
  },
  {
    icon: BarChart3,
    title: "Delivery analytics",
    body: "Track sent, delivered, bounced, opened, clicked, replied and unsubscribed — per campaign and per contact.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Admin imports the database",
    body: "Upload a lead file or add companies by hand, then control which of them users may match against.",
  },
  {
    step: "02",
    title: "User defines an ICP",
    body: "Industry, geography, company size, revenue, job titles, technologies, keywords and exclusions.",
  },
  {
    step: "03",
    title: "AI matches and scores",
    body: "Every candidate is filtered, scored, and explained so a rep knows exactly why it surfaced.",
  },
  {
    step: "04",
    title: "User unlocks and campaigns",
    body: "Spend credits to unlock contact details, write the email, and send it through their own SMTP.",
  },
];

const PROOF_POINTS = [
  { value: "1 database", label: "Curated by admins, matched by everyone" },
  { value: "3 ways to write", label: "AI, visual blocks, or raw HTML" },
  { value: "0 shared inboxes", label: "Every send goes through your own SMTP" },
];

const TESTIMONIALS = [
  {
    quote:
      "We replaced a weekly list-buying ritual with an ICP we can edit in a sentence. The scored matches meant we stopped guessing which rows were worth opening.",
    name: "Priya Raman",
    role: "Head of Growth, B2B SaaS",
    avatar: "/images/marketing/avatar-1.jpg",
  },
  {
    quote:
      "Sending from our own SMTP was the deciding factor. Our deliverability recovered within the first week and the suppression list kept things clean.",
    name: "Daniel Okafor",
    role: "Sales Operations Lead",
    avatar: "/images/marketing/avatar-2.jpg",
  },
  {
    quote:
      "The explanations behind each score are what sold the team. Nobody has to take the matching on faith before spending a credit.",
    name: "Elena Fischer",
    role: "Founder, RevOps consultancy",
    avatar: "/images/marketing/avatar-3.jpg",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  const ctaHref = user
    ? user.role === "ADMIN"
      ? "/admin"
      : "/dashboard"
    : "/register";
  const ctaLabel = user ? "Open your workspace" : "Start matching leads";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <SiteHeader />

      <main className="flex flex-1 flex-col">
        {/* ============================================================
            Hero
            ============================================================ */}
        <section className="relative overflow-hidden">
          {/* Soft brand wash behind the hero */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
            style={{
              background:
                "radial-gradient(60rem 30rem at 50% -10%, color-mix(in srgb, var(--secondary) 22%, transparent), transparent 70%)",
            }}
          />

          <div className="section-container section-padding">
            <div className="grid items-center gap-scale-lg-10 lg:grid-cols-[1.05fr_1fr]">
              {/* Copy */}
              <div className="flex flex-col gap-scale-md-6">
                <span className="inline-flex w-fit items-center gap-scale-sm-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-scale-sm-3 py-scale-sm-2 para-text-xs text-[var(--text-secondary)]">
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-[var(--success)]"
                  />
                  AI lead matching · outbound campaigns
                </span>

                <h1 className="h1 max-w-[16ch]">
                  From ideal customer profile to inbox.
                </h1>

                <p className="para-text-lg max-w-[54ch] text-[var(--text-secondary)]">
                  Cosmora matches your ICP against a verified lead database,
                  scores every match, and sends personalised outreach through
                  your own SMTP — without handing you a shared inbox.
                </p>

                <div className="flex flex-wrap items-center gap-scale-md-4">
                  <Link href={ctaHref}>
                    <Button
                      variant="primary"
                      size="lg"
                      icon={<ArrowRight size={16} />}
                    >
                      {ctaLabel}
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button variant="outline" size="lg">
                      Explore features
                    </Button>
                  </Link>
                </div>

                <ul className="flex flex-wrap items-center gap-scale-md-5">
                  {["No credit card", "Free plan", "Send from your own SMTP"].map(
                    (point) => (
                      <li
                        key={point}
                        className="flex items-center gap-scale-sm-2 para-text-xs text-[var(--text-muted)]"
                      >
                        <span
                          aria-hidden
                          className="flex size-4 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--text-primary)] [&>svg]:size-2.5"
                        >
                          <Check />
                        </span>
                        {point}
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* Hero visual */}
              <div className="relative">
                <MarketingImage
                  src="/images/marketing/home-hero-workspace.jpg"
                  alt="A sales team reviewing lead data and campaign results on screen"
                  ratio="5/4"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  priority
                />

                {/* Floating stat card */}
                <div className="absolute -bottom-5 left-0 hidden w-[240px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-scale-md-4 shadow-[var(--shadow-lg)] sm:block">
                  <div className="flex items-center justify-between gap-scale-sm-3">
                    <span className="para-text-xxs uppercase tracking-widest text-[var(--text-muted)]">
                      Match rate
                    </span>
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--success)_12%,transparent)] px-scale-sm-2 py-scale-sm-1 para-text-xxs font-semibold text-[var(--success)]">
                      Live
                    </span>
                  </div>
                  <p className="mt-scale-sm-2 text-[28px] font-semibold leading-none tracking-[-0.02em] text-[var(--text-primary)]">
                    248
                  </p>
                  <p className="mt-scale-sm-2 para-text-xxs text-[var(--text-secondary)]">
                    Scored leads from your last ICP run
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            Proof strip
            ============================================================ */}
        <section className="border-y border-[var(--border)] bg-[var(--card)]">
          <div className="section-container">
            <dl className="grid divide-[var(--border)] sm:grid-cols-3 sm:divide-x">
              {PROOF_POINTS.map((point) => (
                <div
                  key={point.value}
                  className="flex flex-col gap-scale-sm-1 px-scale-sm-4 py-scale-md-6 first:pl-0 last:pr-0"
                >
                  <dt className="h6">{point.value}</dt>
                  <dd className="para-text-xs text-[var(--text-muted)]">
                    {point.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ============================================================
            Features
            ============================================================ */}
        <section className="section-padding">
          <div className="section-container flex flex-col gap-scale-lg-10">
            <div className="flex flex-col items-start justify-between gap-scale-md-5 lg:flex-row lg:items-end">
              <SectionHeading
                eyebrow="Capabilities"
                title="Everything V1 covers"
                description="A focused first release: manage the database, match it, and send real email from your own infrastructure."
              />
              <Link
                href="/features"
                className="inline-flex shrink-0 items-center gap-2 para-text-sm font-medium text-[var(--text-primary)] underline-offset-4 hover:underline"
              >
                See all features
                <ArrowRight size={15} aria-hidden />
              </Link>
            </div>

            <ul className="grid gap-scale-md-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <li
                  key={feature.title}
                  className="group flex flex-col gap-scale-sm-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-scale-md-6 transition-colors hover:border-[var(--text-muted)]"
                >
                  <span
                    aria-hidden
                    className="flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--muted)] text-[var(--text-primary)] transition-colors group-hover:bg-[var(--bg-2)] group-hover:text-[var(--text-neutral)] [&>svg]:size-[25px]"
                  >
                    <feature.icon />
                  </span>
                  <h3 className="h6">{feature.title}</h3>
                  <p className="para-text-sm text-[var(--text-secondary)]">
                    {feature.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============================================================
            How it works
            ============================================================ */}
        <section className="border-y border-[var(--border)] bg-[var(--card)] section-padding">
          <div className="section-container">
            <div className="grid gap-scale-lg-10 lg:grid-cols-[1fr_1.1fr]">
              {/* Visual cluster */}
              <div className="flex flex-col gap-scale-md-6">
                <MarketingImage
                  src="/images/marketing/home-matching-flow.jpg"
                  alt="Colleagues walking through a lead matching workflow"
                  ratio="4/3"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />

                <div className="grid grid-cols-2 gap-scale-md-4">
                  <MarketingImage
                    src="/images/marketing/home-analytics-panel.jpg"
                    alt="Analytics charts for an outreach campaign"
                    ratio="4/3"
                    sizes="(max-width: 1024px) 50vw, 22vw"
                  />
                  <MarketingImage
                    src="/images/marketing/home-team-working.jpg"
                    alt="Two teammates working at a laptop together"
                    ratio="4/3"
                    sizes="(max-width: 1024px) 50vw, 22vw"
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-scale-lg-8">
                <SectionHeading
                  eyebrow="How it works"
                  title="Four steps from a spreadsheet to a running campaign"
                  description="Nothing here needs a data engineer or a deliverability consultant."
                />

                <ol className="flex flex-col gap-scale-md-6">
                  {STEPS.map((item, index) => (
                    <li key={item.step} className="flex gap-scale-md-4">
                      <div className="flex flex-col items-center">
                        <span
                          aria-hidden
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-2)] para-text-xs font-semibold text-[var(--text-neutral)]"
                        >
                          {index + 1}
                        </span>
                        {index < STEPS.length - 1 ? (
                          <span
                            aria-hidden
                            className="mt-2 w-px flex-1 bg-[var(--border)]"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-scale-sm-2 pb-scale-md-2">
                        <span className="para-text-xxs uppercase tracking-widest text-[var(--text-muted)]">
                          {item.step}
                        </span>
                        <h3 className="h5">{item.title}</h3>
                        <p className="para-text-sm text-[var(--text-secondary)]">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            Own SMTP
            ============================================================ */}
        <section className="section-padding">
          <div className="section-container">
            <div className="grid items-center gap-scale-lg-10 lg:grid-cols-2">
              <MarketingImage
                src="/images/marketing/home-modern-office.jpg"
                alt="A modern office where a sales team works"
                ratio="4/3"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />

              <div className="flex flex-col gap-scale-md-5">
                <SectionHeading
                  eyebrow="Your infrastructure"
                  title="Send from your own SMTP, not ours"
                  description="Shared sending infrastructure is where deliverability goes to die. Cosmora keeps your credentials encrypted at rest, your limits yours, and your reputation yours."
                />

                <ul className="flex flex-col gap-scale-sm-4">
                  {[
                    "Encrypted credentials, never exposed in the interface.",
                    "Daily send limits and inter-send delays enforced before queuing.",
                    "Transient failures retried; hard bounces auto-suppressed.",
                    "Suppression re-checked at send time, not just at queue time.",
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
                  href="/features"
                  className="inline-flex w-fit items-center gap-2 para-text-sm font-medium text-[var(--text-primary)] underline-offset-4 hover:underline"
                >
                  How delivery works
                  <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            Testimonials
            ============================================================ */}
        <section className="border-y border-[var(--border)] bg-[var(--card)] section-padding">
          <div className="section-container flex flex-col gap-scale-lg-10">
            <SectionHeading
              eyebrow="Teams"
              title="What reps say after the first campaign"
              align="center"
            />

            <ul className="grid gap-scale-md-6 md:grid-cols-3">
              {TESTIMONIALS.map((item) => (
                <li
                  key={item.name}
                  className="flex flex-col gap-scale-md-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-scale-md-6"
                >
                  <span
                    aria-hidden
                    className="flex size-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--muted)] text-[var(--text-muted)] [&>svg]:size-4"
                  >
                    <Quote />
                  </span>

                  <p className="para-text-sm text-[var(--text-secondary)]">
                    {item.quote}
                  </p>

                  <div className="mt-auto flex items-center gap-scale-sm-3 border-t border-[var(--border)] pt-scale-md-4">
                    <span className="relative size-9 shrink-0 overflow-hidden rounded-full bg-[var(--muted)]">
                      <Image
                        src={item.avatar}
                        alt=""
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="para-text-sm font-medium text-[var(--text-primary)]">
                        {item.name}
                      </span>
                      <span className="para-text-xxs text-[var(--text-muted)]">
                        {item.role}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ============================================================
            Closing CTA
            ============================================================ */}
        <section className="section-padding">
          <div className="section-container">
            <div className="relative overflow-hidden rounded-[var(--radius-3xl)] bg-[var(--bg-2)]">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  backgroundImage: "url(/images/marketing/home-cta-band.jpg)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.22,
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--bg-2) 72%, transparent) 0%, var(--bg-2) 78%)",
                }}
              />

              <div className="relative flex flex-col items-center gap-scale-md-6 px-scale-md-8 py-scale-lg-12 text-center">
                <h2 className="h2 max-w-[22ch] text-[var(--text-neutral)]">
                  Ready to build your pipeline?
                </h2>
                <p
                  className="para-text-md max-w-[56ch]"
                  style={{
                    color:
                      "color-mix(in srgb, var(--text-neutral) 74%, transparent)",
                  }}
                >
                  Create an account to describe your ICP and start matching
                  against the lead database. Administrators can import leads and
                  manage users from the admin console.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-scale-md-4">
                  <Link href={ctaHref}>
                    <Button variant="secondary" size="lg">
                      {ctaLabel}
                    </Button>
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] border px-5 para-text-sm font-medium transition-colors"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--text-neutral) 30%, transparent)",
                      color: "var(--text-neutral)",
                    }}
                  >
                    View pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}