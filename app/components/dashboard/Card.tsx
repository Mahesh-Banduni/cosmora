import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export function Card({
  title,
  description,
  actions,
  children,
  className = "",
  padded = true,
}: CardProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <section
      className={`
        flex flex-col
        rounded-[var(--radius-lg)]
        border border-[var(--border)]
        bg-[var(--card)]
        ${padded ? "p-5" : ""}
        ${className}
      `}
    >
      {hasHeader ? (
        <div
          className={`
            flex flex-col gap-3
            sm:flex-row sm:items-start sm:justify-between
            ${padded ? "mb-5" : "border-b border-[var(--border)] p-5"}
          `}
        >
          <div className="flex min-w-0 flex-col gap-1">
            {title ? <h3 className="h6">{title}</h3> : null}
            {description ? (
              <p className="text-[13px] leading-[1.45] text-[var(--text-muted)]">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
};

export function StatCard({ label, value, hint, icon, trend }: StatCardProps) {
  return (
    <div
      className={`
        flex flex-col gap-3
        rounded-[var(--radius-lg)]
        border border-[var(--border)]
        bg-[var(--card)]
        p-4
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--text-muted)]">
          {label}
        </span>
        {icon ? (
          <span
            aria-hidden
            className={`
              flex size-8 shrink-0 items-center justify-center
              rounded-[var(--radius-md)]
              border border-[var(--border)]
              bg-[var(--muted)]
              text-[var(--text-secondary)]
              [&>svg]:size-4
            `}
          >
            {icon}
          </span>
        ) : null}
      </div>

      <span
        data-numeric
        className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-[var(--text-primary)]"
      >
        {value}
      </span>

      {hint || trend ? (
        <div className="flex items-center gap-1.5">
          {trend ? (
            <span
              data-numeric
              className={`
                text-[12px] font-medium
                ${
                  trend.direction === "up"
                    ? "text-[var(--success)]"
                    : trend.direction === "down"
                      ? "text-[var(--destructive)]"
                      : "text-[var(--text-muted)]"
                }
              `}
            >
              {trend.value}
            </span>
          ) : null}
          {hint ? (
            <span className="text-[12px] text-[var(--text-muted)]">{hint}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      {icon ? (
        <span
          aria-hidden
          className={`
            flex size-11 items-center justify-center
            rounded-full
            border border-[var(--border)]
            bg-[var(--muted)]
            text-[var(--text-muted)]
            [&>svg]:size-5
          `}
        >
          {icon}
        </span>
      ) : null}

      <div className="flex flex-col gap-1">
        <h4 className="h6">{title}</h4>
        {description ? (
          <p className="max-w-[46ch] text-[13px] leading-[1.5] text-[var(--text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>

      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}

type StatusTone = "neutral" | "success" | "warning" | "danger" | "brand";

const toneStyles: Record<StatusTone, string> = {
  neutral:
    "bg-[var(--muted)] text-[var(--text-secondary)] border-[var(--border)]",
  success:
    "bg-[color-mix(in_srgb,var(--success)_10%,transparent)] text-[color-mix(in_srgb,var(--success)_88%,black)] border-[color-mix(in_srgb,var(--success)_25%,transparent)]",
  warning:
    "bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-[color-mix(in_srgb,var(--warning)_85%,black)] border-[color-mix(in_srgb,var(--warning)_28%,transparent)]",
  danger:
    "bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] text-[var(--destructive)] border-[color-mix(in_srgb,var(--destructive)_25%,transparent)]",
  brand:
    "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--border)]",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        whitespace-nowrap
        rounded-full
        border
        px-2 py-0.5
        text-[11px]
        font-medium
        leading-[1.4]
        ${toneStyles[tone]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}