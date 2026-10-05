import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import Button from "@/app/components/ui/store/Button";

/** Primary navigation shared by every marketing page. */
const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export async function SiteHeader({ active }: { active?: string }) {
  const user = await getCurrentUser();

  const ctaHref = user
    ? user.role === "ADMIN"
      ? "/admin"
      : "/dashboard"
    : "/register";
  const ctaLabel = user ? "Open workspace" : "Start free";

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_88%,transparent)] backdrop-blur">
      <div className="section-container flex items-center justify-between gap-scale-md-4 py-scale-md-4">
        <Link
          href="/"
          aria-label="Cosmora home"
          className="flex items-center gap-scale-sm-2"
        >
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand)] para-text-sm font-bold text-[var(--brand-foreground)]"
          >
            C
          </span>
          <span className="h6">Cosmora</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-scale-sm-1">
            {NAV_LINKS.map((link) => {
              const isActive = active === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`inline-flex h-9 items-center rounded-[var(--radius-md)] px-scale-sm-3 para-text-sm transition-colors ${
                      isActive
                        ? "bg-[var(--muted)] font-medium text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-scale-sm-3">
          {user ? null : (
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost">Sign in</Button>
            </Link>
          )}
          <Link href={ctaHref}>
            <Button variant="primary">{ctaLabel}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}