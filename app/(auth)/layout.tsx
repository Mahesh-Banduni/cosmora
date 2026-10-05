import type { ReactNode } from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <div className="flex w-full flex-col justify-center px-5 py-10 sm:px-8 lg:w-1/2 lg:px-12">
        <div className="mx-auto flex w-full max-w-[400px] flex-col gap-8">
          <Link
            href="/"
            className="flex w-fit items-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ring)]"
          >
            <span
              aria-hidden
              className="flex size-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--brand)] text-[15px] font-bold text-[var(--brand-foreground)]"
            >
              C
            </span>
            <span className="text-[17px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
              Cosmora
            </span>
          </Link>

          {children}
        </div>
      </div>

      <aside className="hidden bg-[var(--bg-2)] lg:flex lg:w-1/2 lg:items-center lg:justify-center lg:px-12">
        <div className="flex max-w-[440px] flex-col gap-6">
          <h3 className="h2 text-[var(--text-neutral)]">
            Turn an ideal customer profile into booked conversations.
          </h3>

          <p
            style={{
              color: "color-mix(in srgb, var(--text-neutral) 72%, transparent)",
            }}
            className="text-[15px] leading-[1.55]"
          >
            Cosmora matches your ICP against a verified lead database, scores
            every match, and sends personalised outreach through your own SMTP.
          </p>

          <dl className="grid grid-cols-3 gap-6 border-t border-[color-mix(in_srgb,var(--text-neutral)_16%,transparent)] pt-6">
            {[
              { label: "Lead matching", value: "AI" },
              { label: "Email modes", value: "3" },
              { label: "Sending", value: "Own SMTP" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <dt
                  style={{
                    color:
                      "color-mix(in srgb, var(--text-neutral) 62%, transparent)",
                  }}
                  className="text-[11px] font-semibold uppercase tracking-[0.04em]"
                >
                  {item.label}
                </dt>
                <dd
                  style={{ color: "var(--text-neutral)" }}
                  className="text-[16px] font-semibold tracking-[-0.01em]"
                >
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}