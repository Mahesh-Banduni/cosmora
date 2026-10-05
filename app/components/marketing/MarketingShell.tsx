import type { ReactNode } from "react";
import { SiteHeader } from "@/app/components/marketing/SiteHeader";
import { SiteFooter } from "@/app/components/marketing/SiteFooter";

/**
 * Page shell for every public marketing route. Marking the header `active`
 * drives both the primary nav and per-page `<title>` metadata handled by each
 * page individually.
 */
export function MarketingShell({
  active,
  children,
}: {
  active?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <SiteHeader active={active} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}