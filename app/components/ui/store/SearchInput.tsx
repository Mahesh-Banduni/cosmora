"use client";

import { Search, X } from "lucide-react";
import Input from "./Input";

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
}

export default function SearchInput({
  className = "",
  value,
  onClear,
  disabled,
  ...props
}: SearchInputProps) {
  const searchValue = value?.toString() ?? "";
  const showClear = searchValue.length > 0 && !disabled;

  return (
    <div className="relative w-full">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-muted)] [&>svg]:size-4"
      >
        <Search />
      </span>

      <Input
        {...props}
        type="text"
        role="searchbox"
        value={value}
        disabled={disabled}
        className={`pl-9 ${showClear ? "pr-9" : "pr-3"} ${className}`}
      />

      {showClear ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={onClear}
          className="
            absolute inset-y-0 right-1.5 my-auto flex size-7 items-center
            justify-center rounded-[var(--radius-xs)] text-[var(--text-muted)]
            transition-colors
            hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]
            focus-visible:outline-2 focus-visible:outline-offset-1
            focus-visible:outline-[var(--ring)]
            [&>svg]:size-4
          "
        >
          <X />
        </button>
      ) : null}
    </div>
  );
}