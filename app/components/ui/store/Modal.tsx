"use client";

import { useEffect, useId } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Accessible label for the dialog. Rendered as a visible heading when set. */
  title?: string;
  className?: string;
}

export default function Modal({
  open,
  onClose,
  children,
  title,
  className = "",
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent background scroll while the dialog is open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--text-primary)_40%,transparent)] backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        className={`
          relative z-10
          flex w-full max-w-lg flex-col
          max-h-[calc(100dvh-2rem)]
          rounded-[var(--radius-xl)]
          border border-[var(--border)]
          bg-[var(--popover)]
          text-[var(--text-primary)]
          shadow-[var(--shadow-lg)]
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
            <h2 id={titleId} className="h6">
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] [&>svg]:size-4"
            >
              <X aria-hidden />
            </button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>
  );
}