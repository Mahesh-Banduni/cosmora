export default function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={`
        block
        min-h-24
        w-full
        resize-y
        rounded-[var(--radius-md)]
        border
        border-[var(--input)]
        bg-[var(--surface)]
        px-3
        py-2
        text-[14px]
        leading-[1.55]
        text-[var(--text-primary)]
        shadow-[var(--shadow-xs)]
        transition-[border-color,box-shadow,background-color]
        duration-150
        ease-[var(--ease-out-quart)]

        placeholder:text-[var(--text-muted)]

        hover:border-[color-mix(in_srgb,var(--input)_100%,var(--text-muted)_40%)]

        focus:outline-none
        focus:border-[var(--ring)]
        focus:ring-2
        focus:ring-[color-mix(in_srgb,var(--ring)_22%,transparent)]

        disabled:cursor-not-allowed
        disabled:opacity-60
        disabled:bg-[var(--muted)]
        disabled:shadow-none

        aria-[invalid=true]:border-[var(--destructive)]
        aria-[invalid=true]:ring-2
        aria-[invalid=true]:ring-[color-mix(in_srgb,var(--destructive)_18%,transparent)]
      `}
    />
  );
}