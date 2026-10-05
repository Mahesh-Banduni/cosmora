"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export type FaqItem = {
  q: string;
  a: string;
};

export type FaqGroup = {
  id: string;
  title: string;
  items: FaqItem[];
};

/**
 * Disclosure list for the FAQ. Kept as a client component so only the
 * accordion hydrates; the surrounding page stays a server component.
 */
export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [open, setOpen] = useState<string | null>(groups[0]?.items[0]?.q ?? null);

  return (
    <div className="flex flex-col gap-scale-lg-8">
      {groups.map((group) => (
        <div key={group.id} id={group.id} className="flex flex-col gap-scale-md-5">
          <h2 className="h4">{group.title}</h2>

          <ul className="flex flex-col gap-scale-sm-3">
            {group.items.map((item) => {
              const isOpen = open === item.q;
              const panelId = `faq-panel-${group.id}-${item.q.replace(/\W+/g, "-").toLowerCase()}`;

              return (
                <li
                  key={item.q}
                  className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)]"
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : item.q)}
                      className="flex w-full items-center justify-between gap-scale-md-4 px-scale-md-5 py-scale-md-4 text-left transition-colors hover:bg-[var(--surface-hover)]"
                    >
                      <span className="para-text-sm font-medium text-[var(--text-primary)]">
                        {item.q}
                      </span>
                      <span
                        aria-hidden
                        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-[var(--text-secondary)]"
                      >
                        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                      </span>
                    </button>
                  </h3>

                  {isOpen ? (
                    <div
                      id={panelId}
                      className="border-t border-[var(--border)] px-scale-md-5 py-scale-md-4"
                    >
                      <p className="para-text-sm text-[var(--text-secondary)]">
                        {item.a}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}