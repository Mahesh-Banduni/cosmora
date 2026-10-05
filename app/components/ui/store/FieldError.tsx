interface FieldErrorProps {
  /** Error message to display; renders nothing when undefined/empty. */
  message?: string | undefined;
}

/**
 * Small helper used across forms to render an inline validation error
 * produced by the Zod schemas in `lib/validation.ts`.
 */
export default function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-1 text-[12px] font-medium leading-[1.45] text-[var(--destructive)]"
    >
      <span aria-hidden>&bull;</span>
      {message}
    </p>
  );
}