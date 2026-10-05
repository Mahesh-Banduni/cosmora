import type { ReactNode } from "react";
import Link from "next/link";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: { label: string; href?: string }[];
};

/**
 * Shared page heading. Uses the global heading/paragraph tokens rather than
 * ad-hoc text sizing so dashboards stay on the design system.
 */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        {breadcrumb && breadcrumb.length > 0 ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[12px] leading-[1.4] text-[var(--text-muted)]">
              {breadcrumb.map((crumb, index) => (
                <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 ? (
                    <span aria-hidden className="opacity-60">
                      /
                    </span>
                  ) : null}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="rounded-[var(--radius-xs)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-[var(--text-secondary)]">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <h2 className="h3">{title}</h2>

        {description ? (
          <p className="max-w-[68ch] text-[14px] leading-[1.55] text-[var(--text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}