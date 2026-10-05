"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Sparkles, Plus, X } from "lucide-react";
import { useOnChange } from "@/app/components/dashboard/useOnChange";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";
import { Card, Badge } from "@/app/components/dashboard/Card";
import { parseRequirementsAction, createIcpAction } from "@/app/actions/leads";
import type { ParsedRequirements } from "@/lib/lead-intelligence";
import type { ActionResult } from "@/lib/action-result";

const FILTER_FIELDS = [
  { key: "industries", label: "Industries" },
  { key: "countries", label: "Countries" },
  { key: "states", label: "States / Regions" },
  { key: "cities", label: "Cities" },
  { key: "jobTitles", label: "Job titles" },
  { key: "technologies", label: "Technologies" },
  { key: "keywords", label: "Keywords" },
  { key: "exclusions", label: "Exclusions" },
] as const;

type FieldKey = (typeof FILTER_FIELDS)[number]["key"];

const joinList = (value: string): string[] =>
  value
    .split(/[;,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean);

function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} disabled={pending} className={className}>
      {pending ? <Loader2 className="animate-spin" /> : null}
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function IcpBuilderForm() {
  const router = useRouter();
  const parseFormRef = useRef<HTMLFormElement>(null);

  const [parseState, parseAction, isParsing] = useActionState<
    ActionResult<ParsedRequirements> | null,
    FormData
  >(parseRequirementsAction, null);

  const [saveState, saveAction, isSaving] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createIcpAction, null);

  const [filters, setFilters] = useState<Record<FieldKey, string[]>>({
    industries: [],
    countries: [],
    states: [],
    cities: [],
    jobTitles: [],
    technologies: [],
    keywords: [],
    exclusions: [],
  });

  const [numbers, setNumbers] = useState({
    sizeMin: "",
    sizeMax: "",
    revenueMin: "",
    revenueMax: "",
  });

  // AI-derived filters populate the structured form once parsing succeeds.
    useOnChange(parseState, (previous) => {
      if (!parseState?.ok || parseState === previous) return;
    const parsed = parseState.data;
      if (!parsed) return;

    setFilters({
      industries: parsed.industries,
      countries: parsed.countries,
      states: parsed.states,
      cities: parsed.cities,
      jobTitles: parsed.jobTitles,
      technologies: parsed.technologies,
      keywords: parsed.keywords,
      exclusions: parsed.exclusions,
    });

    setNumbers({
      sizeMin: parsed.sizeMin?.toString() ?? "",
      sizeMax: parsed.sizeMax?.toString() ?? "",
      revenueMin: parsed.revenueMin?.toString() ?? "",
      revenueMax: parsed.revenueMax?.toString() ?? "",
    });
    });

    // Free-text fields are uncontrolled, so they are seeded straight into the DOM.
    useEffect(() => {
      if (!parseState?.ok) return;
      const parsed = parseState.data;
      if (!parsed) return;

      const nameInput = document.getElementById("name") as HTMLInputElement | null;
      if (nameInput && !nameInput.value && parsed.icpName) {
        nameInput.value = parsed.icpName;
      }

      const descriptionInput = document.getElementById("description") as HTMLTextAreaElement | null;
      if (descriptionInput && !descriptionInput.value && parsed.description) {
        descriptionInput.value = parsed.description;
    }

      const requirementInput = document.getElementById(
        "naturalLanguageRequirements"
      ) as HTMLTextAreaElement | null;
      if (requirementInput && parsed.naturalLanguageRequirements) {
        requirementInput.value = parsed.naturalLanguageRequirements;
      }
    }, [parseState]);

    useOnChange(saveState, () => {
      if (saveState?.ok && saveState.data) {
        router.push(`/dashboard/icps/${saveState.data.id}`);
      }
    });

  const parsed = parseState?.ok ? parseState.data : null;

  return (
    <div className="flex flex-col gap-scale-md-6">
      {/* Step 1 — describe the customer in plain language. */}
      <Card
        title="1. Describe your ideal customer"
        description="Write it however you think about it. AI converts this into structured filters."
      >
        <form ref={parseFormRef} action={parseAction} className="flex flex-col gap-scale-sm-4">
          <div className="flex flex-col gap-scale-sm-2">
            <Label htmlFor="requirements">Who do you want to sell to?</Label>
            <textarea
              id="requirements"
              name="requirements"
              rows={5}
              required
              placeholder="e.g. B2B SaaS companies in the US and UK with 50-500 employees that use React and have a VP of Sales or Head of Growth. Exclude agencies and companies under 20 people."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm leading-relaxed text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none"
            />
          </div>

          {parseState && !parseState.ok ? (
            <p role="alert" className="para-text-sm text-[var(--destructive)]">
              {parseState.error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-scale-sm-3">
            <SubmitButton pendingLabel="Reading…" variant="secondary">
              <Sparkles size={15} aria-hidden />
              Generate filters with AI
            </SubmitButton>

            {parsed ? (
              <span className="para-text-xs text-[var(--success)]">
                Filters generated — review and refine them below.
              </span>
            ) : null}
          </div>
        </form>
      </Card>

      {/* Step 2 — review and refine the structured filters. */}
      <Card
        title="2. Review the match criteria"
        description="These become the database filters used to find and score leads."
      >
        <form action={saveAction} className="flex flex-col gap-scale-md-6">
          <div className="grid gap-scale-sm-4 sm:grid-cols-2">
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="name">ICP name</Label>
              <Input id="name" name="name" required placeholder="US mid-market SaaS" />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Optional notes" />
            </div>
          </div>

          <div className="flex flex-col gap-scale-sm-2">
            <Label htmlFor="naturalLanguageRequirements">
              Original requirements <span className="text-[var(--text-muted)]">(kept for reference)</span>
            </Label>
            <textarea
              id="naturalLanguageRequirements"
              name="naturalLanguageRequirements"
              rows={3}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--brand)] focus:outline-none"
            />
          </div>

          <FilterFieldGrid
            filters={filters}
            setFilters={setFilters}
            nameFor={(key) => key}
          />

          <div className="grid gap-scale-sm-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="sizeMin">Min employees</Label>
              <Input
                id="sizeMin"
                name="sizeMin"
                type="number"
                min={0}
                value={numbers.sizeMin}
                onChange={(event) =>
                  setNumbers((prev) => ({ ...prev, sizeMin: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="sizeMax">Max employees</Label>
              <Input
                id="sizeMax"
                name="sizeMax"
                type="number"
                min={0}
                value={numbers.sizeMax}
                onChange={(event) =>
                  setNumbers((prev) => ({ ...prev, sizeMax: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="revenueMin">Min revenue</Label>
              <Input
                id="revenueMin"
                name="revenueMin"
                type="number"
                min={0}
                value={numbers.revenueMin}
                onChange={(event) =>
                  setNumbers((prev) => ({ ...prev, revenueMin: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="revenueMax">Max revenue</Label>
              <Input
                id="revenueMax"
                name="revenueMax"
                type="number"
                min={0}
                value={numbers.revenueMax}
                onChange={(event) =>
                  setNumbers((prev) => ({ ...prev, revenueMax: event.target.value }))
                }
              />
            </div>
          </div>

          {saveState && !saveState.ok ? (
            <p role="alert" className="para-text-sm text-[var(--destructive)]">
              {saveState.error}
            </p>
          ) : null}

          <SubmitButton pendingLabel="Saving…" className="w-fit">
            Save ICP and run matching
          </SubmitButton>
        </form>
      </Card>
    </div>
  );
}

function FilterFieldGrid({
  filters,
  setFilters,
  nameFor,
}: {
  filters: Record<FieldKey, string[]>;
  setFilters: React.Dispatch<React.SetStateAction<Record<FieldKey, string[]>>>;
  nameFor: (key: FieldKey) => string;
}) {
  return (
    <div className="grid gap-scale-md-5 sm:grid-cols-2 lg:grid-cols-4">
      {FILTER_FIELDS.map((field) => (
        <FilterField
          key={field.key}
          field={field}
          values={filters[field.key]}
          onChange={(values) =>
            setFilters((prev) => ({ ...prev, [field.key]: values }))
          }
          inputName={nameFor(field.key)}
        />
      ))}
    </div>
  );
}

function FilterField({
  field,
  values,
  onChange,
  inputName,
}: {
  field: { key: FieldKey; label: string };
  values: string[];
  onChange: (values: string[]) => void;
  inputName: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const additions = joinList(draft);
    if (additions.length === 0) return;

    onChange([...new Set([...values, ...additions])]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-scale-sm-2">
      <Label htmlFor={`filter-${field.key}`}>{field.label}</Label>

      {/* Comma-separated value that carries the chips to the server action. */}
      <input type="hidden" name={inputName} value={values.join(",")} />

      <div className="flex gap-scale-sm-2">
        <Input
          id={`filter-${field.key}`}
          value={draft}
          placeholder="Add value"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add} aria-label={`Add ${field.label}`}>
          <Plus size={15} aria-hidden />
        </Button>
      </div>

      {values.length > 0 ? (
        <ul className="flex flex-wrap gap-scale-sm-1.5">
          {values.map((value) => (
            <li key={value}>
              <Badge tone={field.key === "exclusions" ? "danger" : "brand"}>
                <span className="max-w-[160px] truncate">{value}</span>
                <button
                  type="button"
                  aria-label={`Remove ${value}`}
                  onClick={() => onChange(values.filter((entry) => entry !== value))}
                  className="ml-1 opacity-70 transition hover:opacity-100"
                >
                  <X size={12} aria-hidden />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}