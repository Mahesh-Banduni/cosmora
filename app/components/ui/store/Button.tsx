import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost";

type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = {
  children?: ReactNode;
  /** Leading icon rendered before the label. */
  icon?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to the width of the container. */
  block?: boolean;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    border-[var(--brand)]
    bg-[var(--brand)]
    text-[var(--brand-foreground)]
    shadow-[var(--shadow-xs)]
    hover:bg-[color-mix(in_srgb,var(--brand)_88%,white)]
    hover:border-[color-mix(in_srgb,var(--brand)_88%,white)]
    active:bg-[color-mix(in_srgb,var(--brand)_80%,black)]
    active:border-[color-mix(in_srgb,var(--brand)_80%,black)]
  `,

  secondary: `
    border-[var(--secondary)]
    bg-[var(--secondary)]
    text-[var(--secondary-foreground)]
    shadow-[var(--shadow-xs)]
    hover:bg-[color-mix(in_srgb,var(--secondary)_90%,white)]
    hover:border-[color-mix(in_srgb,var(--secondary)_90%,white)]
    active:bg-[color-mix(in_srgb,var(--secondary)_82%,black)]
    active:border-[color-mix(in_srgb,var(--secondary)_82%,black)]
  `,

  outline: `
    border-[var(--border)]
    bg-[var(--surface)]
    text-[var(--text-primary)]
    hover:bg-[var(--surface-hover)]
    hover:border-[var(--input)]
    active:bg-[color-mix(in_srgb,var(--surface-hover)_100%,black_4%)]
  `,

  danger: `
    border-[var(--destructive)]
    bg-[var(--destructive)]
    text-white
    shadow-[var(--shadow-xs)]
    hover:bg-[color-mix(in_srgb,var(--destructive)_88%,black)]
    hover:border-[color-mix(in_srgb,var(--destructive)_88%,black)]
    active:bg-[color-mix(in_srgb,var(--destructive)_80%,black)]
    active:border-[color-mix(in_srgb,var(--destructive)_80%,black)]
  `,

  ghost: `
    border-transparent
    bg-transparent
    text-[var(--text-secondary)]
    hover:bg-[var(--surface-hover)]
    hover:text-[var(--text-primary)]
    active:bg-[color-mix(in_srgb,var(--surface-hover)_100%,black_4%)]
  `,
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "h-8 px-3 text-[13px] gap-1.5",
      md: "h-9 px-4 text-[14px] gap-2",
      lg: "h-11 px-5 text-[15px] gap-2",
      icon: "h-9 w-9 p-0",
    };

export default function Button({
  children,
  icon,
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        inline-flex shrink-0 items-center justify-center
        ${sizeStyles[size]}
        ${block ? "w-full" : ""}

        rounded-[var(--radius-button)]
        border
        font-heading font-medium
        tracking-[-0.005em]
        whitespace-nowrap
        select-none
        outline-none
        cursor-pointer

        /* Normalize lucide icon sizing so icons stay optically consistent */
        [&>svg]:block [&>svg]:shrink-0 [&>svg]:size-4

        transition-[background-color,border-color,color,box-shadow]
        duration-150
        ease-[var(--ease-out-quart)]

        disabled:pointer-events-none
        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:shadow-none

        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[var(--ring)]

        ${variantStyles[variant]}
        ${className}
      `}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}