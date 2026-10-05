import type { ReactNode } from "react";
import Image from "next/image";

/**
 * Full-width page banner. `eyebrow` renders a small uppercase label above the
 * title, which is the consistent opener on every marketing page.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  align = "center",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  children?: ReactNode;
}) {
  const centered = align === "center";

  return (
    <section className="section-container section-padding">
      <div
        className={`flex flex-col gap-scale-md-5 ${
          centered ? "mx-auto max-w-[760px] items-center text-center" : "max-w-[720px]"
        }`}
      >
        {eyebrow ? (
          <span className="para-text-xs uppercase tracking-widest text-[var(--text-muted)]">
            {eyebrow}
          </span>
        ) : null}

        <h1 className="h1 max-w-[20ch]">{title}</h1>

        {description ? (
          <p className="para-text-lg max-w-[64ch] text-[var(--text-secondary)]">
            {description}
          </p>
        ) : null}

        {children ? <div className="mt-scale-sm-2 flex flex-wrap items-center gap-scale-md-4">{children}</div> : null}
      </div>
    </section>
  );
}

/**
 * Section heading block reused by every marketing section so vertical rhythm
 * stays consistent between pages.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <div
      className={`flex max-w-[62ch] flex-col gap-scale-sm-3 ${
        centered ? "mx-auto items-center text-center" : ""
      }`}
    >
      {eyebrow ? (
        <span className="para-text-xs uppercase tracking-widest text-[var(--text-muted)]">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="h2">{title}</h2>
      {description ? (
        <p className="para-text-md text-[var(--text-secondary)]">{description}</p>
      ) : null}
    </div>
  );
}

/** Bordered surface used for cards, quotes and callouts across marketing pages. */
export function Panel({
  children,
  className = "",
  tone = "card",
}: {
  children: ReactNode;
  className?: string;
  tone?: "card" | "muted" | "dark";
}) {
  const tones = {
    card: "border-[var(--border)] bg-[var(--card)]",
    muted: "border-[var(--border)] bg-[var(--muted)]",
    dark: "border-transparent bg-[var(--bg-2)]",
  } as const;

  return (
    <div
      className={`rounded-[var(--radius-2xl)] border p-scale-md-6 ${tones[tone]} ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Remote marketing image with a consistent aspect ratio and rounded frame.
 * Sized with `fill` because the stored crops have no intrinsic size we can
 * rely on across the responsive breakpoints.
 */
export function MarketingImage({
  src,
  alt,
  ratio = "16/10",
  className = "",
  sizes = "(max-width: 1024px) 100vw, 50vw",
  priority = false,
}: {
  src: string;
  alt: string;
  ratio?: `${number}/${number}`;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--muted)] ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

/** Dark banner with a single call to action, reused to close every page. */
export function ClosingCta({
  title,
  description,
  primary,
  secondary,
}: {
  title: string;
  description: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="section-container section-padding">
      <div className="relative overflow-hidden rounded-[var(--radius-3xl)] bg-[var(--bg-2)] px-scale-md-8 py-scale-md-12 text-center">
        <div className="relative mx-auto flex max-w-[620px] flex-col items-center gap-scale-md-5">
          <h2 className="h2 text-[var(--text-neutral)]">{title}</h2>
          <p
            className="para-text-md"
            style={{ color: "color-mix(in srgb, var(--text-neutral) 72%, transparent)" }}
          >
            {description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-scale-md-4">
            <a
              href={primary.href}
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] bg-[var(--secondary)] px-5 para-text-sm font-medium text-[var(--secondary-foreground)] transition-colors hover:bg-[color-mix(in_srgb,var(--secondary)_88%,white)]"
            >
              {primary.label}
            </a>
            {secondary ? (
              <a
                href={secondary.href}
                className="inline-flex h-11 items-center justify-center rounded-[var(--radius-button)] border px-5 para-text-sm font-medium transition-colors"
                style={{
                  borderColor: "color-mix(in srgb, var(--text-neutral) 28%, transparent)",
                  color: "var(--text-neutral)",
                }}
              >
                {secondary.label}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}