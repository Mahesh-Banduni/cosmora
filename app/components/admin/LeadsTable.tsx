"use client";

import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useOnChange } from "@/app/components/dashboard/useOnChange";
import { Loader2, Trash2, ShieldCheck, Building2, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/store/Table";
import SearchInput from "@/app/components/ui/store/SearchInput";
import Input from "@/app/components/ui/store/Input";
import Button from "@/app/components/ui/store/Button";
import Modal from "@/app/components/ui/store/Modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/store/Select";
import { Badge, EmptyState } from "@/app/components/dashboard/Card";
import {
  createCompanyAction,
  deleteCompanyAction,
  setCompanyAvailabilityAction,
  verifyCompanyAction,
} from "@/app/actions/admin-leads";
import type { ActionResult } from "@/lib/action-result";

export type CompanyRow = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  country: string | null;
  employeeCount: number | null;
  status: "AVAILABLE" | "RESERVED" | "LOCKED" | "ARCHIVED";
  isVerified: boolean;
  qualityScore: number;
  contactCount: number;
};

const statusOptions = [
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
  { value: "LOCKED", label: "Locked" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

function SubmitButton({
  children,
  pendingLabel,
  className = "",
  variant = "primary",
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
  variant?: "primary" | "outline" | "danger" | "ghost";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      className={className}
    >
      {pending ? <Loader2 className="animate-spin" /> : null}
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function CreateCompanyForm() {
  const router = useRouter();
  const [state, formAction] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createCompanyAction, null);
  const [open, setOpen] = useState(false);

    useOnChange(state, (previous) => {
      if (state?.ok && state !== previous) {
      setOpen(false);
      router.refresh();
    }
    });

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setOpen(true)}
        icon={<Plus className="size-4" aria-hidden />}
      >
        Add company
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add company"
        className="max-w-3xl"
      >
        <form
          action={formAction}
          className="flex flex-col gap-scale-sm-4"
        >
          {state && !state.ok ? (
            <p role="alert" className="para-text-sm text-[var(--destructive)]">
              {state.error}
            </p>
          ) : null}

          <div className="grid gap-scale-sm-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-scale-sm-2">
              <label htmlFor="name" className="para-text-xs text-[var(--text-secondary)]">
                Company name
              </label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <label htmlFor="domain" className="para-text-xs text-[var(--text-secondary)]">
                Domain
              </label>
              <Input id="domain" name="domain" placeholder="acme.com" />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <label htmlFor="industry" className="para-text-xs text-[var(--text-secondary)]">
                Industry
              </label>
              <Input id="industry" name="industry" />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <label htmlFor="website" className="para-text-xs text-[var(--text-secondary)]">
                Website
              </label>
              <Input id="website" name="website" placeholder="https://" />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <label
                htmlFor="employeeCount"
                className="para-text-xs text-[var(--text-secondary)]"
              >
                Employees
              </label>
              <Input id="employeeCount" name="employeeCount" type="number" min={0} />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <label htmlFor="country" className="para-text-xs text-[var(--text-secondary)]">
                Country
              </label>
              <Input id="country" name="country" />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <label htmlFor="state" className="para-text-xs text-[var(--text-secondary)]">
                State / Region
              </label>
              <Input id="state" name="state" />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <label htmlFor="city" className="para-text-xs text-[var(--text-secondary)]">
                City
              </label>
              <Input id="city" name="city" />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <label htmlFor="revenueMin" className="para-text-xs text-[var(--text-secondary)]">
                Min revenue
              </label>
              <Input id="revenueMin" name="revenueMin" type="number" min={0} />
            </div>
          </div>

          <div className="grid gap-scale-sm-4 sm:grid-cols-2">
            <div className="flex flex-col gap-scale-sm-2">
              <label
                htmlFor="technologies"
                className="para-text-xs text-[var(--text-secondary)]"
              >
                Technologies (comma separated)
              </label>
              <Input id="technologies" name="technologies" placeholder="React, Node.js" />
            </div>
            <div className="flex flex-col gap-scale-sm-2">
              <label htmlFor="keywords" className="para-text-xs text-[var(--text-secondary)]">
                Keywords (comma separated)
              </label>
              <Input id="keywords" name="keywords" placeholder="saas, b2b" />
            </div>
          </div>

          <div className="flex flex-col gap-scale-sm-2">
            <label
              htmlFor="description"
              className="para-text-xs text-[var(--text-secondary)]"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand)] focus:outline-none"
              placeholder="What the company does"
            />
          </div>

          <label className="flex items-center gap-scale-sm-2 para-text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              name="isVerified"
              className="size-4 accent-[var(--brand)]"
            />
            Mark as verified
          </label>

          <div className="flex items-center justify-end gap-scale-sm-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <SubmitButton pendingLabel="Creating…">Create company</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function LeadsTable({
  companies,
  query,
}: {
  companies: CompanyRow[];
  query: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(query);

  return (
    <div className="flex flex-col gap-scale-md-4">
      <form
        className="flex flex-wrap items-center gap-scale-sm-3"
        onSubmit={(event) => {
          event.preventDefault();
          const params = new URLSearchParams();
          if (search.trim()) params.set("q", search.trim());
          router.push(`/admin/leads?${params.toString()}`);
        }}
      >
        <div className="min-w-[240px] flex-1">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onClear={() => {
              setSearch("");
              router.push("/admin/leads");
            }}
            placeholder="Search by name, domain, industry, country…"
            aria-label="Search companies"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {companies.length === 0 ? (
        <EmptyState
          title="No companies found"
          description="Adjust your search, or import a lead file to populate the database."
          icon={<Building2 size={20} />}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Contacts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {companies.map((company) => (
              <AvailabilityRow key={company.id} company={company} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function AvailabilityRow({ company }: { company: CompanyRow }) {
  const router = useRouter();

  // Select exposes no native change event, so the inline availability
  // select submits its form through an explicit ref.
  const availabilityFormRef = useRef<HTMLFormElement>(null);

  const [availabilityState, availabilityAction] = useActionState<
    ActionResult | null,
    FormData
  >(setCompanyAvailabilityAction, null);
  const [verifyState, verifyAction] = useActionState<ActionResult | null, FormData>(
    verifyCompanyAction,
    null
  );
  const [deleteState, deleteAction] = useActionState<ActionResult | null, FormData>(
    deleteCompanyAction,
    null
  );

  useOnChange(availabilityState, () => {
      if (availabilityState?.ok) router.refresh();
    });

    useOnChange(verifyState, () => {
      if (verifyState?.ok) router.refresh();
    });

    useOnChange(deleteState, () => {
      if (deleteState?.ok) router.refresh();
    });

  const statusTone =
    company.status === "AVAILABLE"
      ? "success"
      : company.status === "LOCKED"
        ? "danger"
        : company.status === "RESERVED"
          ? "warning"
          : "neutral";

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-scale-sm-1">
          <a
            href={`/admin/leads/${company.id}`}
            className="font-medium text-[var(--text-primary)] underline-offset-2 hover:underline"
          >
            {company.name}
          </a>
          {company.domain ? (
            <span className="para-text-xxs text-[var(--text-muted)]">
              {company.domain}
            </span>
          ) : null}
        </div>
      </TableCell>

      <TableCell className="text-sm">{company.industry ?? "—"}</TableCell>

      <TableCell className="text-sm">{company.country ?? "—"}</TableCell>

      <TableCell className="text-sm">
        {company.employeeCount !== null ? company.employeeCount : "—"}
      </TableCell>

      <TableCell className="text-sm">{company.contactCount}</TableCell>

      <TableCell>
        <div className="flex flex-col items-start gap-scale-sm-2">
          <Badge tone={statusTone}>{company.status}</Badge>
          {company.isVerified ? (
            <Badge tone="brand">
              <ShieldCheck size={12} aria-hidden />
              Verified
            </Badge>
          ) : null}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-scale-sm-2">
          <form action={availabilityAction} ref={availabilityFormRef}>
            <input type="hidden" name="id" value={company.id} />
                      <Select
              name="status"
              defaultValue={company.status}
                        onValueChange={() => availabilityFormRef.current?.requestSubmit()}
                      >
                        <SelectTrigger
                          aria-label={`Availability for ${company.name}`}
                          className="h-9 rounded-lg px-2 text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>

                        <SelectPortal>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </SelectPortal>
                      </Select>
                    </form>

          <form action={verifyAction}>
            <input type="hidden" name="id" value={company.id} />
            <input
              type="hidden"
              name="verified"
              value={company.isVerified ? "false" : "true"}
            />
            <Button type="submit" variant="ghost" className="h-9 px-2.5">
              {company.isVerified ? "Unverify" : "Verify"}
            </Button>
          </form>

          <form action={deleteAction}>
            <input type="hidden" name="id" value={company.id} />
            <Button
              type="submit"
              variant="ghost"
              className="h-9 px-2.5"
              aria-label={`Delete ${company.name}`}
            >
              <Trash2 size={15} aria-hidden />
            </Button>
          </form>
        </div>
      </TableCell>
    </TableRow>
  );
}