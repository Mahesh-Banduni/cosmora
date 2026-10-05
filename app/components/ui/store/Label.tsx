interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export default function Label({
  children,
  required,
  htmlFor,
  className = "",
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`
        inline-flex items-center gap-0.5
        text-[13px]
        font-medium
        leading-[1.4]
        text-[var(--text-primary)]
        ${className}
      `}
    >
      {children}
      {required ? (
        <span aria-hidden className="text-[var(--destructive)]">
          *
        </span>
      ) : null}
    </label>
  );
}