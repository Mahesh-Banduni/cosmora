import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

export function Table({
  className = "",
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div
      className={`
        relative w-full overflow-x-auto
        rounded-[var(--radius-lg)]
        border border-[var(--border)]
        bg-[var(--card)]
        ${className}
      `}
    >
      <table
        className="w-full caption-bottom text-[13px] leading-[1.5]"
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={className} {...props} />;
}

export function TableBody({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={`divide-y divide-[var(--border)] ${className}`}
      {...props}
    />
  );
}

export function TableFooter({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={`
        border-t border-[var(--border)]
        bg-[var(--muted)]
        font-medium
        ${className}
      `}
      {...props}
    />
  );
}

export function TableRow({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`
        transition-colors
        hover:bg-[var(--surface-hover)]
        ${className}
      `}
      {...props}
    />
  );
}

export function TableHead({
  className = "",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={`
        h-10 px-4 text-left align-middle
        text-[11px]
        font-semibold
        uppercase
        tracking-[0.04em]
        text-[var(--text-muted)]
        whitespace-nowrap
        bg-[var(--surface-hover)]
        ${className}
      `}
      {...props}
    />
  );
}

export function TableCell({
  className = "",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`
        px-4 py-3 align-middle
        text-[13px]
        text-[var(--text-secondary)]
        ${className}
      `}
      {...props}
    />
  );
}

export function TableCaption({
  className = "",
  ...props
}: HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={`
        mt-3 text-[12px] text-[var(--text-muted)]
        ${className}
      `}
      {...props}
    />
  );
}