"use client";

import { useState } from "react";

interface TabItem {
  label: string;
  value: string;
}

interface TabsProps {
  tabs?: TabItem[];
  active?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const defaultTabs = [
  { label: "Overview", value: "overview" },
  { label: "Settings", value: "settings" },
];

export default function Tabs({
  tabs = defaultTabs,
  active: controlledActive,
  onChange,
  className = "",
}: TabsProps) {
  const [internalActive, setInternalActive] = useState(
    tabs[0]?.value || "overview"
  );

  const active =
    controlledActive !== undefined ? controlledActive : internalActive;

  const handleTabClick = (value: string) => {
    if (onChange) {
      onChange(value);
    } else {
      setInternalActive(value);
    }
  };

  return (
    <div
      role="tablist"
      className={`
        inline-flex items-center gap-0.5
        rounded-[var(--radius-md)]
        border border-[var(--border)]
        bg-[var(--muted)]
        p-0.5
        ${className}
      `}
    >
      {tabs.map((tab) => {
        const selected = active === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => handleTabClick(tab.value)}
            className={`
              inline-flex items-center justify-center
              rounded-[calc(var(--radius-md)-2px)]
              px-3 py-1.5
              text-[13px]
              font-medium
              leading-[1.4]
              whitespace-nowrap
              cursor-pointer
              outline-none
              transition-[background-color,color,box-shadow]
              duration-150
              ease-[var(--ease-out-quart)]

              focus-visible:outline-2
              focus-visible:outline-offset-1
              focus-visible:outline-[var(--ring)]

              ${
                selected
                  ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}