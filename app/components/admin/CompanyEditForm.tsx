"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Loader2, Pencil } from "lucide-react";

import { updateCompanyAction } from "@/app/actions/admin-leads";
import { Card } from "@/app/components/dashboard/Card";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";
import type { ActionResult } from "@/lib/action-result";

export type EditableCompany = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  website: string | null;
  employeeCount: number | null;
  country: string | null;
  state: string | null;
  city: string | null;
  revenueMin: number | null;
  revenueMax: number | null;
  technologies: string | null;
  keywords: string | null;
  description: string | null;
  isVerified: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Pencil className="size-4" />
      )}
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

function Field({
  id,
  label,
  ...inputProps
}: {
  id: string;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-scale-sm-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} {...inputProps} />
    </div>
  );
}

export default function CompanyEditForm({
  company,
}: {
  company: EditableCompany;
}) {
  const [state, action] = useActionState<ActionResult<{ id: string }> | null, FormData>(
    updateCompanyAction,
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <Card title="Edit company">
      <form action={action} className="flex flex-col gap-scale-md-4">
        <input type="hidden" name="id" value={company.id} />

        <div className="grid gap-scale-sm-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field
            id="name"
            label="Name"
            defaultValue={company.name}
            required
          />
          <Field
            id="domain"
            label="Domain"
            defaultValue={company.domain ?? ""}
          />
          <Field
            id="industry"
            label="Industry"
            defaultValue={company.industry ?? ""}
          />
          <Field
            id="website"
            label="Website"
            defaultValue={company.website ?? ""}
          />
          <Field
            id="employeeCount"
            label="Employees"
            type="number"
            defaultValue={company.employeeCount ?? ""}
          />
          <Field
            id="country"
            label="Country"
            defaultValue={company.country ?? ""}
          />
          <Field
            id="state"
            label="State / Region"
            defaultValue={company.state ?? ""}
          />
          <Field
            id="city"
            label="City"
            defaultValue={company.city ?? ""}
          />
          <Field
            id="revenueMin"
            label="Min revenue"
            type="number"
            defaultValue={company.revenueMin ?? ""}
          />
          <Field
            id="revenueMax"
            label="Max revenue"
            type="number"
            defaultValue={company.revenueMax ?? ""}
          />
          <Field
            id="technologies"
            label="Technologies"
            defaultValue={company.technologies ?? ""}
            placeholder="React, Node.js"
          />
          <Field
            id="keywords"
            label="Keywords"
            defaultValue={company.keywords ?? ""}
            placeholder="saas, b2b"
          />
        </div>

        <div className="flex flex-col gap-scale-sm-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={company.description ?? ""}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-scale-md-3 py-scale-md-2 para-text-sm text-[var(--text-primary)]"
          />
        </div>

        <div className="flex items-center gap-scale-sm-2">
          <input
            id="isVerified"
            name="isVerified"
            type="checkbox"
            defaultChecked={company.isVerified}
            className="size-4 accent-[var(--brand)]"
          />
          <Label htmlFor="isVerified">Verified</Label>
        </div>

        {state && !state.ok ? (
          <p role="alert" className="para-text-sm text-[var(--destructive)]">
            {state.error}
          </p>
        ) : null}

        {state?.ok ? (
          <p className="para-text-xs text-[var(--success)]">{state.message}</p>
        ) : null}

        <div>
          <SubmitButton />
        </div>
      </form>
    </Card>
  );
}
