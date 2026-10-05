type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const baseInput = `
  w-full
  h-10
  px-3
  rounded-[var(--radius-md)]
  border
  border-[var(--input)]
  bg-[var(--surface)]
  text-[var(--text-primary)]
  text-[14px]
  leading-[1.45]
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
`;

export default function Input({
  className = "",
  ...props
}: InputProps) {
  return <input {...props} className={`${baseInput} ${className}`} />;
}