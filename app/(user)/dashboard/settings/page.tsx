import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card } from "@/app/components/dashboard/Card";
import { ProfileSettingsForm } from "@/app/components/dashboard/ProfileSettingsForm";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  const [organization, ledger, creditCount] = await Promise.all([
    user.organizationId
      ? prisma.organization.findUnique({
          where: { id: user.organizationId },
          select: { name: true },
        })
      : null,
    prisma.creditTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.creditTransaction.count({ where: { userId: user.id } }),
  ]);

  return (
    <>
      <PageHeader title="Settings" description="Your account details and credit history." />

      <div className="grid gap-scale-md-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileSettingsForm name={user.name} email={user.email} />
        </div>

        <div className="flex flex-col gap-scale-md-6">
          <Card title="Account" className="lg:col-span-1">
            <dl className="flex flex-col gap-scale-sm-4">
              {[
                { label: "Role", value: user.role === "ADMIN" ? "Administrator" : "User" },
                { label: "Organization", value: organization?.name ?? "None" },
                { label: "Status", value: "Active" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-scale-sm-3 border-b border-[var(--border)] pb-scale-sm-3 last:border-0 last:pb-0"
                >
                  <dt className="para-text-xs text-[var(--text-secondary)]">{item.label}</dt>
                  <dd className="para-text-sm font-medium text-[var(--text-primary)]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>

      <Card
        title="Credit history"
        description={`${formatNumber(creditCount)} transactions`}
        padded={true}
      >
        {ledger.length === 0 ? (
          <div className="p-scale-md-6">
            <p className="para-text-sm text-[var(--text-muted)]">No credit activity yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {ledger.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-scale-sm-3 px-scale-md-6 py-scale-sm-4"
              >
                <div className="flex min-w-0 flex-col gap-scale-sm-1">
                  <span className="truncate para-text-sm text-[var(--text-primary)]">
                    {entry.reason}
                  </span>
                  <span className="para-text-xxs text-[var(--text-muted)]">
                    {formatDateTime(entry.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-scale-sm-4">
                  <span
                    className={`para-text-sm font-medium ${
                      entry.amount >= 0 ? "text-[var(--success)]" : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {entry.amount >= 0 ? "+" : ""}
                    {entry.amount}
                  </span>
                  <span className="para-text-xs text-[var(--text-muted)]">
                    Balance {entry.balanceAfter}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}