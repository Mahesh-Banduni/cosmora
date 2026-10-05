"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!show || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const spaceAbove = triggerRect.top;
    const spaceBelow = window.innerHeight - triggerRect.bottom;

    const openTop = spaceAbove > tooltipRect.height + 8 || spaceAbove > spaceBelow;

    const top = openTop
      ? triggerRect.top + window.scrollY - tooltipRect.height - 8
      : triggerRect.bottom + window.scrollY + 8;

    let left =
      triggerRect.left +
      window.scrollX +
      (triggerRect.width - tooltipRect.width) / 2;

    // prevent horizontal overflow
    left = Math.max(
      8,
      Math.min(left, window.scrollX + window.innerWidth - tooltipRect.width - 8)
    );

    setPosition({ top, left });
  }, [show]);

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
      >
        {children}
      </div>

      {show
        ? createPortal(
            <div
              ref={tooltipRef}
              role="tooltip"
              style={{
                position: "absolute",
                top: position.top,
                left: position.left,
              }}
              className="
                z-[9999]
                max-w-xs
                rounded-[var(--radius-md)]
                border border-[var(--border)]
                bg-[var(--popover)]
                px-2.5 py-1.5
                text-[12px]
                leading-[1.4]
                text-[var(--text-primary)]
                shadow-[var(--shadow-popover)]
                pointer-events-none
              "
            >
              {text}
            </div>,
            document.body
          )
        : null}
    </>
  );
}