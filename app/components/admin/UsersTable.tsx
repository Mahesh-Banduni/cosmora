"use client";

import { useRouter } from "next/navigation";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useOnChange } from "@/app/components/dashboard/useOnChange";
import { Loader2, UserPlus, Trash2, ShieldCheck, Coins } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/store/Table";
import { Card, Badge } from "@/app/components/dashboard/Card";
import Button from "@/app/components/ui/store/Button";
import Modal from "@/app/components/ui/store/Modal";
import Input from "@/app/components/ui/store/Input";
import Label from "@/app/components/ui/store/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/store/Select";
import {
  adjustCreditsAction,
  assignOrganizationAction,
  createUserAction,
  updateUserRoleAction,
  updateUserStatusAction,
} from "@/app/actions/admin-users";
import type { ActionResult } from "@/lib/action-result";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INVITED" | "SUSPENDED";
  organizationId: string | null;
  organizationName: string | null;
  createdAt: Date;
  credits: number;
};

export type OrganizationOption = { id: string; name: string };

function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className = "",
  icon,
    disabled = false,
  }: {
    children?: React.ReactNode;
    pendingLabel: string;
    variant?: "primary" | "outline" | "ghost" | "danger";
    className?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
  }) {
    const { pending } = useFormStatus();

    return (
      <Button
        type="submit"
        variant={variant}
        disabled={pending || disabled}
        className={className}
      >
        {pending ? <Loader2 className="animate-spin" /> : icon}
        {pending ? pendingLabel : children}
      </Button>
    );
  }

export function CreateUserForm({
  organizations,
}: {
  organizations: OrganizationOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(createUserAction, null);

  useOnChange(state, (previous) => {
      if (state?.ok && state !== previous) {
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
        icon={<UserPlus size={15} aria-hidden />}
      >
        New user
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a user"
        className="max-w-xl"
      >
        <form action={formAction} className="flex flex-col gap-scale-sm-4">
            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>

            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="password">Temporary password</Label>
              <Input
                id="password"
                name="password"
                type="text"
                minLength={8}
                required
                placeholder="At least 8 characters"
              />
            </div>

            <div className="grid gap-scale-sm-4 sm:grid-cols-2">
              <div className="flex flex-col gap-scale-sm-2">
                <Label htmlFor="role">Role</Label>
                                <Select name="role" defaultValue="USER">
                                  <SelectTrigger id="role" className="h-12 rounded-xl px-4 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>

                                  <SelectPortal>
                                    <SelectContent>
                                      <SelectItem value="USER">User</SelectItem>
                                      <SelectItem value="ADMIN">Administrator</SelectItem>
                                    </SelectContent>
                                  </SelectPortal>
                                </Select>
              </div>

              <div className="flex flex-col gap-scale-sm-2">
                <Label htmlFor="credits">Starting credits</Label>
                <Input
                  id="credits"
                  name="credits"
                  type="number"
                  min={0}
                  defaultValue={0}
                />
              </div>
            </div>

            <div className="flex flex-col gap-scale-sm-2">
              <Label htmlFor="organizationId">Organization</Label>
                            <Select name="organizationId" defaultValue="">
                              <SelectTrigger id="organizationId" className="h-12 rounded-xl px-4 text-sm">
                                <SelectValue placeholder="None" />
                              </SelectTrigger>

                              <SelectPortal>
                                <SelectContent>
                                  <SelectItem value="">None</SelectItem>
                                  {organizations.map((org) => (
                                    <SelectItem key={org.id} value={org.id}>
                                      {org.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </SelectPortal>
                            </Select>
            </div>

            {state && !state.ok ? (
              <p role="alert" className="para-text-sm text-[var(--destructive)]">
                {state.error}
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-scale-sm-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <SubmitButton pendingLabel="Creating…">Create user</SubmitButton>
            </div>
        </form>
      </Modal>
    </>
  );
}

export function UsersTable({
  users,
  organizations,
  currentUserId,
}: {
  users: UserRow[];
  organizations: OrganizationOption[];
  currentUserId: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = users.filter((user) => {
    if (!search.trim()) return true;
    const needle = search.trim().toLowerCase();
    return (
      user.name.toLowerCase().includes(needle) ||
      user.email.toLowerCase().includes(needle) ||
      (user.organizationName ?? "").toLowerCase().includes(needle)
    );
  });

  return (
    <Card>
      <div className="flex flex-col gap-scale-md-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name, email or organization…"
          aria-label="Search users"
        />

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((user) => (
              <UserRowItem
                key={user.id}
                user={user}
                organizations={organizations}
                isSelf={user.id === currentUserId}
              />
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 ? (
          <p className="para-text-sm text-[var(--text-muted)]">No users match that search.</p>
        ) : null}
      </div>
    </Card>
  );
}

function UserRowItem({
  user,
  organizations,
  isSelf,
}: {
  user: UserRow;
  organizations: OrganizationOption[];
  isSelf: boolean;
}) {
  const router = useRouter();

  // Select has no native change event, so the row-level selects submit
  // their surrounding form through an explicit ref.
  const roleFormRef = useRef<HTMLFormElement>(null);
  const orgFormRef = useRef<HTMLFormElement>(null);

  const [statusState, statusAction] = useActionState<ActionResult | null, FormData>(
    updateUserStatusAction,
    null
  );
  const [roleState, roleAction] = useActionState<ActionResult | null, FormData>(
    updateUserRoleAction,
    null
  );
  const [orgState, orgAction] = useActionState<ActionResult | null, FormData>(
    assignOrganizationAction,
    null
  );
  const [creditState, creditAction] = useActionState<ActionResult | null, FormData>(
    adjustCreditsAction,
    null
  );

  useOnChange(statusState, () => {
      if (statusState?.ok) router.refresh();
    });

    useOnChange(roleState, () => {
      if (roleState?.ok) router.refresh();
    });

    useOnChange(orgState, () => {
      if (orgState?.ok) router.refresh();
    });

    useOnChange(creditState, () => {
      if (creditState?.ok) router.refresh();
    });

  const statusTone =
    user.status === "ACTIVE"
      ? "success"
      : user.status === "SUSPENDED"
        ? "danger"
        : "warning";

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col gap-scale-sm-1">
          <span className="font-medium text-[var(--text-primary)]">
            {user.name}
            {isSelf ? (
              <span className="para-text-xxs text-[var(--text-muted)]"> (you)</span>
            ) : null}
          </span>
          <span className="para-text-xxs text-[var(--text-muted)]">{user.email}</span>
        </div>
      </TableCell>

      <TableCell>
              <form action={roleAction} ref={roleFormRef}>
          <input type="hidden" name="id" value={user.id} />
                <Select
            name="role"
            defaultValue={user.role}
                  onValueChange={() => roleFormRef.current?.requestSubmit()}
                >
                  <SelectTrigger
                    disabled={isSelf}
                    aria-label={`Role for ${user.name}`}
                    className="h-9 rounded-lg px-2 text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectPortal>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </form>
            </TableCell>

      <TableCell>
        <Badge tone={statusTone}>{user.status}</Badge>
      </TableCell>

      <TableCell>
              <form action={orgAction} ref={orgFormRef}>
          <input type="hidden" name="id" value={user.id} />
                <Select
            name="organizationId"
            defaultValue={user.organizationId ?? ""}
                  onValueChange={() => orgFormRef.current?.requestSubmit()}
                >
                  <SelectTrigger
                    aria-label={`Organization for ${user.name}`}
                    className="h-9 max-w-[180px] rounded-lg px-2 text-xs"
                  >
                    <SelectValue placeholder="None" />
                  </SelectTrigger>

                  <SelectPortal>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </form>
            </TableCell>

      <TableCell className="text-sm font-medium text-[var(--text-primary)]">
        {user.credits}
      </TableCell>

      <TableCell>
        <div className="flex flex-wrap items-center justify-end gap-scale-sm-2">
          <form action={creditAction} className="flex items-center gap-scale-sm-1">
            <input type="hidden" name="id" value={user.id} />
            <input
              type="number"
              name="amount"
              defaultValue={25}
              aria-label={`Credit amount for ${user.name}`}
              className="h-9 w-20 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--text-primary)]"
            />
            <SubmitButton
              pendingLabel="…"
              variant="outline"
              className="h-9 px-2.5"
              icon={<Coins size={13} aria-hidden />}
            >
              Add
            </SubmitButton>
          </form>

          <form action={statusAction}>
            <input type="hidden" name="id" value={user.id} />
            <input
              type="hidden"
              name="status"
              value={user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"}
            />
            <SubmitButton
              pendingLabel="…"
              variant="ghost"
              className="h-9 px-2.5"
              disabled={isSelf}
            >
              {user.status === "SUSPENDED" ? "Restore" : "Suspend"}
            </SubmitButton>
          </form>
        </div>
      </TableCell>
    </TableRow>
  );
}

export { ShieldCheck, Trash2 };