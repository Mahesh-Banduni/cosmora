/**
 * Result envelope returned by every server action.
 *
 * Kept free of any server-only imports (Prisma, crypto, node:*) because
 * client components import `ActionResult` for their `useActionState` types.
 */
export type ActionResult<T = unknown> =
  | { ok: true; message?: string; data: T }
  | { ok: false; error: string };

export function ok<T>(data: T, message?: string): ActionResult<T>;
export function ok(message?: string): ActionResult<undefined>;
export function ok<T>(data?: T, message?: string): ActionResult<T | undefined> {
  return { ok: true, data, message };
}

/**
 * A failure carries no data, so it satisfies `ActionResult<T>` for any `T`.
 */
export function fail<T = unknown>(error: string): ActionResult<T> {
  return { ok: false, error };
}

export function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}

export function parseList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/[;,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseNumber(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ==========================================================================
   Formatting
   ========================================================================== */

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${((value / total) * 100).toFixed(1)}%`;
}

export function formatCurrency(
  value: number | null | undefined,
  currency = "USD"
): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}