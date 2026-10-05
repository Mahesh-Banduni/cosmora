interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  /** Accessible name for the switch. */
  "aria-label"?: string;
  id?: string;
}

export default function Switch({
  checked,
  onChange,
  disabled = false,
  ...props
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex shrink-0
        h-5 w-9 shrink-0
        items-center
        rounded-full
        border border-transparent
        transition-colors
        duration-150
        ease-[var(--ease-out-quart)]

        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[var(--ring)]

        disabled:cursor-not-allowed
        disabled:opacity-50

        ${
          checked
            ? "bg-[var(--brand)]"
            : "bg-[color-mix(in_srgb,var(--border)_100%,var(--text-muted)_25%)]"
        }
      `}
      {...props}
    >
      <span
        aria-hidden
        className={`
          pointer-events-none block size-4 rounded-full
          bg-white shadow-[var(--shadow-sm)]
          transition-transform
          duration-150
          ease-[var(--ease-out-quart)]
          ${checked ? "translate-x-[18px]" : "translate-x-[2px]"}
        `}
      />
    </button>
  );
}