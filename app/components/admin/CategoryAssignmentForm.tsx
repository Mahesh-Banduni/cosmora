"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Loader2, Tags } from "lucide-react";

import { setCompanyCategoriesAction } from "@/app/actions/admin-users";
import Button from "@/app/components/ui/store/Button";
import Label from "@/app/components/ui/store/Label";
import type { ActionResult } from "@/lib/action-result";

export type AssignableCategory = {
  id: string;
  name: string;
  description: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Tags className="size-4" />
      )}
      {pending ? "Saving…" : "Save categories"}
    </Button>
  );
}

export default function CategoryAssignmentForm({
  companyId,
  categories,
  selectedCategoryIds,
}: {
  companyId: string;
  categories: AssignableCategory[];
  selectedCategoryIds: string[];
}) {
  const [state, action] = useActionState<ActionResult | null, FormData>(
    setCompanyCategoriesAction,
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-scale-md-4">
      <input type="hidden" name="companyId" value={companyId} />

      {categories.length === 0 ? (
        <p className="para-text-xs text-[var(--text-muted)]">
          No categories available yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-scale-sm-3">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-scale-sm-2">
              <input
                id={`category-${category.id}`}
                name="categoryIds"
                type="checkbox"
                value={category.id}
                defaultChecked={selectedCategoryIds.includes(category.id)}
                className="size-4 accent-[var(--brand)]"
              />
              <Label htmlFor={`category-${category.id}`}>
                {category.name}
              </Label>
            </li>
          ))}
        </ul>
      )}

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
  );
}
