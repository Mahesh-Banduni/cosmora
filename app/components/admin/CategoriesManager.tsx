"use client";

import { Fragment, useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Loader2, Trash2, Plus, Pencil, Tags } from "lucide-react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/admin-users";
import { EmptyState } from "@/app/components/dashboard/Card";
import { useOnChange } from "@/app/components/dashboard/useOnChange";
import Button from "@/app/components/ui/store/Button";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/store/Table";
import type { ActionResult } from "@/lib/action-result";
import Modal from "../ui/store/Modal";

export type AdminCategory = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  companyCount: number;
};

const DEFAULT_COLOR = "#ffd60a";

function colorToHex(value: string | null): string {
  // <input type="color"> only accepts #rrggbb
  if (value && /^#[0-9a-f]{6}$/i.test(value)) return value;
  return DEFAULT_COLOR;
}

function PendingIcon() {
  return <Loader2 className="size-4 animate-spin" aria-hidden />;
}

function CreateSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" disabled={pending}>
      {pending ? <PendingIcon /> : null}
      {pending ? "Creating…" : label}
    </Button>
  );
}

function CategoryFields({
  category,
  idPrefix = "category",
  showColor = true,
}: {
  /** When provided the fields are pre-filled for editing. */
  category?: AdminCategory;
  idPrefix?: string;
  showColor?: boolean;
}) {
  const color = colorToHex(category?.color ?? DEFAULT_COLOR);

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>
        <Input
          id={`${idPrefix}-name`}
          name="name"
          required
          defaultValue={category?.name ?? ""}
          placeholder="e.g. Enterprise SaaS"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Input
          id={`${idPrefix}-description`}
          name="description"
          defaultValue={category?.description ?? ""}
          placeholder="What belongs in this category"
        />
      </div>

      {showColor ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-color`}>Colour</Label>
          <input
            id={`${idPrefix}-color`}
            type="color"
            name="color"
            defaultValue={color}
            className="
              h-10 w-full max-w-[120px] cursor-pointer rounded-[var(--radius-md)]
              border border-[var(--input)] bg-[var(--surface)] p-1
              shadow-[var(--shadow-xs)]
              focus:outline-none
              focus:ring-2
              focus:ring-[color-mix(in_srgb,var(--ring)_22%,transparent)]
            "
          />
        </div>
      ) : null}
    </>
  );
}

export function CategoriesTable({ categories }: { categories: AdminCategory[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  const [deleteState, deleteAction] = useActionState<
    ActionResult | null,
    FormData
  >(deleteCategoryAction, null);

  useOnChange(deleteState, (previous) => {
    if (deleteState?.ok && deleteState !== previous) router.refresh();
  });

  if (categories.length === 0) {
    return (
      <EmptyState
        title="No categories yet"
        description="Create a category to group companies for filtering and reporting."
        icon={<Tags className="size-5" />}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Companies</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((category) => {
            const editing = editingId === category.id;

            return (
              <Fragment key={category.id}>
                <TableRow>
                  <TableCell>
                    <span className="flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className="size-3 shrink-0 rounded-full border border-[var(--border)]"
                        style={{ backgroundColor: colorToHex(category.color) }}
                      />
                      <span className="font-medium text-[var(--text-primary)]">
                        {category.name}
                      </span>
                    </span>
                  </TableCell>

                  <TableCell className="max-w-[320px]">
                    <span className="line-clamp-2 text-[var(--text-muted)]">
                      {category.description || "—"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span data-numeric className="font-medium text-[var(--text-primary)]">
                      {category.companyCount}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(editing ? null : category.id)}
                        icon={<Pencil className="size-4" />}
                      >
                        {editing ? "Close" : "Edit"}
                      </Button>

                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={category.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete ${category.name}`}
                          className="text-[var(--destructive)] hover:bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] hover:text-[var(--destructive)]"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </form>
                    </span>
                  </TableCell>
                </TableRow>

                {editing ? (
                  <TableRow>
                    <TableCell colSpan={4} className="bg-[var(--muted)]">
                      <EditCategoryForm
                        category={category}
                        onDone={() => setEditingId(null)}
                      />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>

      {deleteState && !deleteState.ok ? (
        <p role="alert" className="text-[13px] text-[var(--destructive)]">
          {deleteState.error}
        </p>
      ) : null}
    </div>
  );
}

export function CreateCategoryTrigger() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const [createState, createAction] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createCategoryAction, null);

  useOnChange(createState, (previous) => {
    if (createState?.ok && createState !== previous) {
      setOpen(false);
      router.refresh();
    }
  });

  return (
    <>
      <Button
        type="button"
        variant="primary"
        onClick={() => setOpen(true)}
        icon={<Plus className="size-4" />}
      >
        Add category
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New category"
        className="max-w-xl"
      >
        <form action={createAction} className="flex flex-col gap-4">
          <CategoryFields idPrefix="new" />

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <CreateSubmitButton label="Create category" />
          </div>

          {createState && !createState.ok ? (
            <p role="alert" className="text-[13px] text-[var(--destructive)]">
              {createState.error}
            </p>
          ) : null}
        </form>
      </Modal>
    </>
  );
}

function EditCategoryForm({
  category,
  onDone,
}: {
  category: AdminCategory;
  onDone: () => void;
}) {
  const router = useRouter();
  const [state, action] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(updateCategoryAction, null);

    const onDoneRef = useRef(onDone);

    useEffect(() => {
      onDoneRef.current = onDone;
    });

    useOnChange(state, (previous) => {
      if (state?.ok && state !== previous) {
        onDoneRef.current();
        router.refresh();
      }
    });

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="id" value={category.id} />

      <div className="sm:col-span-2">
              <CategoryFields category={category} idPrefix={`edit-${category.id}`} />
      </div>

      <div className="flex items-end gap-2">
        <EditSubmitButton />
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>

      {state && !state.ok ? (
        <p role="alert" className="text-[13px] text-[var(--destructive)] sm:col-span-2 lg:col-span-4">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function EditSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <PendingIcon /> : null}
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}