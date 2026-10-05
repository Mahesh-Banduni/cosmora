import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import {
  CreateUserForm,
  UsersTable,
  type OrganizationOption,
  type UserRow,
} from "@/app/components/admin/UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const [users, organizations] = await Promise.all([
    prisma.user.findMany({
      include: {
        organization: { select: { id: true, name: true } },
        creditLedger: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { balanceAfter: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const rows: UserRow[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    organizationId: user.organizationId,
    organizationName: user.organization?.name ?? null,
    createdAt: user.createdAt,
    credits: user.creditLedger[0]?.balanceAfter ?? 0,
  }));

  const orgs: OrganizationOption[] = organizations.map((org) => ({
    id: org.id,
    name: org.name,
  }));

  return (
    <>
      <PageHeader
        title="Users and organizations"
        description="Create accounts, assign roles, allocate credits and suspend access."
        actions={<CreateUserForm organizations={orgs} />}
      />

      <UsersTable users={rows} organizations={orgs} currentUserId={admin.id} />
    </>
  );
}