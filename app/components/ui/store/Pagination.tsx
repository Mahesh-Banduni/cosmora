"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults?: number;
  onPageChange: (page: number) => void;
}

/** Compact page window so long result sets stay navigable. */
function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("gap");
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push("gap");
  pages.push(total);

  return pages;
}

const baseButton = `
  inline-flex items-center justify-center
  h-8 min-w-8
  rounded-[var(--radius-md)]
  border
  px-2
  text-[13px]
  font-medium
  leading-none
  cursor-pointer
  outline-none
  transition-[background-color,border-color,color]
  duration-150
  ease-[var(--ease-out-quart)]
  focus-visible:outline-2
  focus-visible:outline-offset-2
  focus-visible:outline-[var(--ring)]
  disabled:cursor-not-allowed
  disabled:opacity-50
  [&>svg]:size-4
`;

export default function Pagination({
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      {typeof totalResults === "number" ? (
        <p className="text-[13px] text-[var(--text-muted)]">
          Page {currentPage} of {totalPages} &middot;{" "}
          {totalResults.toLocaleString()} result{totalResults === 1 ? "" : "s"}
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`
            ${baseButton}
            gap-1
            border-[var(--border)]
            bg-[var(--surface)]
            text-[var(--text-secondary)]
            hover:bg-[var(--surface-hover)]
            hover:text-[var(--text-primary)]
          `}
        >
          <ChevronLeft />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {pages.map((page, index) =>
          page === "gap" ? (
            <span
              key={`gap-${index}`}
              aria-hidden
              className="px-1 text-[13px] text-[var(--text-muted)]"
            >
              &hellip;
            </span>
          ) : (
            <button
              key={page}
              type="button"
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => onPageChange(page)}
              className={`
                ${baseButton}
                ${
                  page === currentPage
                    ? "border-[var(--brand)] bg-[var(--brand)] text-[var(--brand-foreground)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                }
              `}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`
            ${baseButton}
            gap-1
            border-[var(--border)]
            bg-[var(--surface)]
            text-[var(--text-secondary)]
            hover:bg-[var(--surface-hover)]
            hover:text-[var(--text-primary)]
          `}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight />
        </button>
      </div>
    </nav>
  );
}