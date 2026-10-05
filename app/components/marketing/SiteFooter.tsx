import Link from "next/link";

const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
      { href: "/contact#support", label: "Support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]">
      <div className="section-container flex flex-col gap-scale-md-8 py-scale-md-8">
        <div className="grid gap-scale-md-8 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div className="flex max-w-[34ch] flex-col gap-scale-sm-3">
            <Link href="/" className="flex w-fit items-center gap-scale-sm-2">
              <span
                aria-hidden
                className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand)] para-text-sm font-bold text-[var(--brand-foreground)]"
              >
                C
              </span>
              <span className="h6">Cosmora</span>
            </Link>
            <p className="para-text-sm text-[var(--text-secondary)]">
              AI lead matching and outbound campaigns, sent from your own
              infrastructure.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h3 className="h7 text-[var(--text-primary)]">{section.title}</h3>
              <ul className="mt-scale-sm-4 flex flex-col gap-scale-sm-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="para-text-sm text-[var(--text-secondary)] underline-offset-4 transition-colors hover:text-[var(--text-primary)] hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-scale-sm-4 border-t border-[var(--border)] pt-scale-md-6">
          <span className="para-text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} Cosmora. All rights reserved.
          </span>
          <span className="para-text-xs text-[var(--text-muted)]">
            Built for teams who send real email.
          </span>
        </div>
      </div>
    </footer>
  );
}