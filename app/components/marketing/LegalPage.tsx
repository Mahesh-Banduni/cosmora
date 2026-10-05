import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingShell } from "@/app/components/marketing/MarketingShell";
import { PageHero } from "@/app/components/marketing/Marketing";

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
] as const;

/**
 * Shared chrome for the legal documents. A document TOC is rendered beside the
 * clauses so long policies stay navigable.
 */
export function LegalPage({
  title,
  description,
  updated,
  active,
  sections,
}: {
  title: string;
  description: string;
  updated: string;
  active: string;
  sections: { id: string; title: string; body: ReactNode }[];
}) {
  return (
    <MarketingShell active={active}>
      <PageHero eyebrow="Legal" title={title} description={description} />

      <section className="section-container section-padding">
        <div className="flex flex-wrap items-center gap-scale-md-4 border-b border-[var(--border)] pb-scale-md-5">
          <span className="para-text-xs text-[var(--text-muted)]">
            Last updated {updated}
          </span>
          <nav aria-label="Legal" className="flex items-center gap-scale-sm-4">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active === link.href ? "page" : undefined}
                className={`para-text-sm underline-offset-4 transition-colors hover:underline ${
                  active === link.href
                    ? "font-medium text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-scale-lg-10 grid gap-scale-lg-10 lg:grid-cols-[220px_1fr]">
          <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="para-text-xs uppercase tracking-widest text-[var(--text-muted)]">
              On this page
            </h2>
            <ul className="mt-scale-sm-4 flex flex-col gap-scale-sm-3">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="para-text-sm text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-[var(--text-primary)] hover:underline"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex max-w-[76ch] flex-col gap-scale-lg-8">
            {sections.map((section, index) => (
              <article key={section.id} id={section.id} className="flex flex-col gap-scale-md-4">
                <h2 className="h4">
                  <span className="mr-scale-sm-3 para-text-sm font-normal text-[var(--text-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>
                <div className="flex flex-col gap-scale-sm-4 para-text-md text-[var(--text-secondary)]">
                  {section.body}
                </div>
              </article>
            ))}

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--muted)] p-scale-md-6">
              <h2 className="h6">Questions about this document?</h2>
              <p className="para-text-sm mt-scale-sm-3 text-[var(--text-secondary)]">
                Contact us and we will explain it in plain language.
              </p>
              <a
                href="/contact"
                className="mt-scale-md-4 inline-flex h-10 items-center justify-center rounded-[var(--radius-button)] bg-[var(--brand)] px-scale-md-4 para-text-sm font-medium text-[var(--brand-foreground)] transition-colors hover:bg-[color-mix(in_srgb,var(--brand)_88%,white)]"
              >
                Contact us
              </a>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}