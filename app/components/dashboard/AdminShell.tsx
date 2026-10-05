"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Building2,
  Users,
  Database,
  FolderUp,
  Tags,
  ShieldAlert,
  ScrollText,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import type { SessionUser } from "@/lib/auth";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const adminNav: { group: string; items: NavItem[] }[] = [
  {
    group: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: <Building2 size={16} /> }],
  },
  {
    group: "Lead database",
    items: [
      { label: "Companies", href: "/admin/leads", icon: <Database size={16} /> },
      { label: "Contacts", href: "/admin/contacts", icon: <Users size={16} /> },
      { label: "Categories", href: "/admin/categories", icon: <Tags size={16} /> },
      { label: "Imports", href: "/admin/imports", icon: <FolderUp size={16} /> },
    ],
  },
  {
    group: "Platform",
    items: [
      { label: "Users & orgs", href: "/admin/users", icon: <Users size={16} /> },
      { label: "Compliance", href: "/admin/compliance", icon: <ShieldAlert size={16} /> },
      { label: "Audit log", href: "/admin/audit", icon: <ScrollText size={16} /> },
    ],
  },
];

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
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
}

export function AdminShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const current =
    adminNav
      .flatMap((section) => section.items)
      .find((item) => pathname === item.href)?.label ?? "Admin";

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
        <Link href="/admin" onClick={close} className="flex items-center gap-2">
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
              Admin console
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
        {adminNav.map((section) => (
          <div key={section.group} className="mb-5 last:mb-0">
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">
              {section.group}
            </p>

            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  onNavigate={close}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-[var(--sidebar-border)] px-3 py-3">
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

    {/* Main */}
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
          {current}
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