"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Target,
  Search,
  Bookmark,
  Mail,
  BarChart3,
  Server,
  Settings,
  LogOut,
  X,
  Coins,
  PenLine,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const userNav: { group: string; items: NavItem[] }[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={16} /> },
      { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 size={16} /> },
    ],
  },
  {
    group: "Leads",
    items: [
      { label: "My ICPs", href: "/dashboard/icps", icon: <Target size={16} /> },
      { label: "Match leads", href: "/dashboard/leads", icon: <Search size={16} /> },
      { label: "Saved leads", href: "/dashboard/saved", icon: <Bookmark size={16} /> },
    ],
  },
  {
    group: "Outreach",
    items: [
      { label: "Campaigns", href: "/dashboard/campaigns", icon: <Mail size={16} /> },
      { label: "Email builder", href: "/dashboard/builder", icon: <PenLine size={16} /> },
      { label: "SMTP accounts", href: "/dashboard/smtp", icon: <Server size={16} /> },
    ],
  },
  {
    group: "Account",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: <Settings size={16} /> }],
  },
];

export function UserShell({
  user,
  credits,
  children,
}: {
  user: SessionUser;
  credits: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const current = userNav
    .flatMap((section) => section.items)
    .find((item) => pathname === item.href)?.label;

return (
  <div className="min-h-screen bg-[var(--background)]">
    {open ? (
      <div
        className="fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--text-primary)_40%,transparent)] backdrop-blur-[2px] lg:hidden"
        onClick={close}
        aria-hidden
      />
    ) : null}

    {/* Sidebar */}
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        flex h-screen w-[260px] flex-col
        border-r border-[var(--sidebar-border)]
        bg-[var(--sidebar)]
        transition-transform duration-250 ease-[var(--ease-out-quart)]
        lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--sidebar-border)] px-4">
        <Link href="/dashboard" onClick={close} className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand)] text-[13px] font-bold text-[var(--brand-foreground)]"
          >
            C
          </span>

          <span className="flex flex-col leading-tight">
            <span className="text-[14px] font-semibold text-[var(--text-primary)]">
              Cosmora
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Sales workspace
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={close}
          aria-label="Close navigation"
          className="flex size-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-muted)] transition-colors hover:bg-[var(--sidebar-accent)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] lg:hidden [&>svg]:size-4"
        >
          <X />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {userNav.map((section) => (
          <div key={section.group} className="mb-5 last:mb-0">
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">
              {section.group}
            </p>

            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={`
                      flex items-center gap-2.5
                      rounded-[var(--radius-md)]
                      px-2 py-[7px]
                      text-[13px]
                      font-medium
                      transition-[background-color,color]
                      duration-150
                      focus-visible:outline-2 focus-visible:outline-offset-2
                      focus-visible:outline-[var(--ring)]
                      ${
                        active
                          ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--text-primary)]"
                      }
                    `}
                  >
                    <span
                      aria-hidden
                      className={`shrink-0 [&>svg]:size-4 ${
                        active
                          ? "text-[var(--sidebar-accent-foreground)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {item.icon}
                    </span>

                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar footer */}
      <div className="shrink-0 border-t border-[var(--sidebar-border)] px-3 py-3">
        <div className="mb-3 flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card)] px-2.5 py-2">
          <span className="flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
            <Coins
              size={14}
              aria-hidden
              className="text-[var(--text-muted)]"
            />
            Credits
          </span>

          <span
            data-numeric
            className="text-[13px] font-semibold text-[var(--text-primary)]"
          >
            {credits}
          </span>
        </div>

        <div className="mb-2 flex flex-col gap-0.5 px-2">
          <span className="truncate text-[13px] font-medium text-[var(--text-primary)]">
            {user.name}
          </span>

          <span className="truncate text-[11px] text-[var(--text-muted)]">
            {user.email}
          </span>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="
            flex w-full items-center gap-2.5
            rounded-[var(--radius-md)]
            px-2 py-[7px]
            text-[13px]
            font-medium
            text-[var(--text-secondary)]
            transition-colors
            hover:bg-[var(--sidebar-accent)]
            hover:text-[var(--text-primary)]
            focus-visible:outline-2 focus-visible:outline-offset-2
            focus-visible:outline-[var(--ring)]
            [&>svg]:size-4
          "
        >
          <LogOut aria-hidden />
          Sign out
        </button>
      </div>
    </aside>

    {/* Main content */}
    <div className="flex min-h-screen min-w-0 flex-col lg:ml-[260px]">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 backdrop-blur-md sm:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="flex size-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] lg:hidden [&>svg]:size-4"
        >
          <Menu />
        </button>

        <span className="truncate text-[13px] font-medium text-[var(--text-secondary)]">
          {current ?? "Workspace"}
        </span>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  </div>
);
}