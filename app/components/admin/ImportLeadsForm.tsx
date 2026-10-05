"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { FolderUp, Loader2 } from "lucide-react";

import { importLeadsAction } from "@/app/actions/admin-leads";
import { Card } from "@/app/components/dashboard/Card";
import Button from "@/app/components/ui/store/Button";
import { formatNumber, type ActionResult } from "@/lib/action-result";

type ImportSummary = {
  jobId: string;
  imported: number;
  duplicates: number;
  invalid: number;
  total: number;
};

const ACCEPTED_COLUMNS = [
  "Company Name (required)",
  "Industry",
  "Employees",
  "Min Revenue",
  "Max Revenue",
  "Country",
  "State/Region",
  "City",
  "Technologies",
  "First Name",
  "Last Name",
  "Job Title",
  "Email",
  "Phone",
  "LinkedIn URL",
];

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FolderUp className="size-4" />
      )}
      {pending ? "Importing…" : "Import leads"}
    </Button>
  );
}

export default function ImportLeadsForm() {
  const [state, action] = useActionState<
    ActionResult<ImportSummary> | null,
    FormData
  >(importLeadsAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  const summary = state?.ok ? state.data : undefined;

  return (
    <Card
      title="Upload a lead file"
      description="Columns are matched by header name. The first row is treated as the header."
    >
      <form action={action} className="flex flex-col gap-scale-md-4">
        <div className="flex flex-col gap-scale-sm-2">
          <label
            htmlFor="file"
            className="para-text-xs text-[var(--text-secondary)]"
          >
            CSV or Excel file
          </label>
          <input
            id="file"
            name="file"
            type="file"
            required
            accept=".csv,.xlsx,.xls,text/csv"
            className="w-full cursor-pointer rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] px-scale-md-4 py-scale-md-3 para-text-sm text-[var(--text-primary)] file:mr-scale-md-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--muted)] file:px-scale-md-3 file:py-scale-sm-2 file:para-text-xs file:font-medium file:text-[var(--text-primary)]"
          />
        </div>

        <p className="para-text-xxs text-[var(--text-muted)]">
          Accepted columns: {ACCEPTED_COLUMNS.join(", ")}. Multiple Technologies
          are comma separated.
        </p>

        {state && !state.ok ? (
          <p
            role="alert"
            className="para-text-sm text-[var(--destructive)]"
          >
            {state.error}
          </p>
        ) : null}

        {state?.ok && state.data ? (
          <div className="rounded-xl border border-[color-mix(in_srgb,var(--success)_28%,transparent)] px-scale-md-4 py-scale-md-3">
            <p className="para-text-sm font-medium text-[var(--success)]">
              {state.message}
            </p>
            <ul className="mt-scale-sm-2 flex flex-wrap gap-scale-md-4">
              <li className="para-text-xs text-[var(--text-secondary)]">
                Imported:{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {formatNumber(state.data.imported)}
                </span>
              </li>
              <li className="para-text-xs text-[var(--text-secondary)]">
                Duplicates skipped:{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {formatNumber(state.data.duplicates)}
                </span>
              </li>
              <li className="para-text-xs text-[var(--text-secondary)]">
                Invalid:{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {formatNumber(state.data.invalid)}
                </span>
              </li>
              <li className="para-text-xs text-[var(--text-secondary)]">
                Total rows:{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {formatNumber(state.data.total)}
                </span>
              </li>
            </ul>
          </div>
        ) : null}

        <div className="flex items-center gap-scale-md-3">
          <SubmitButton />
          {summary ? (
            <span className="para-text-xxs text-[var(--text-muted)]">
              Job {summary.jobId}
            </span>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
