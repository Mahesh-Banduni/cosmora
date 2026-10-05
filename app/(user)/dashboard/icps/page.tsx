import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card, EmptyState, Badge } from "@/app/components/dashboard/Card";
import Button from "@/app/components/ui/store/Button";
import { Target, Plus } from "lucide-react";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IcpsPage() {
  const user = await requireUser();

  const icps = await prisma.icp.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      scores: { select: { id: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="My ICPs"
        description="Each ICP is a set of filters that the lead database is matched against."
        actions={
          <Link href="/dashboard/icps/new">
            <Button variant="primary">
              <Plus size={15} aria-hidden />
              New ICP
            </Button>
          </Link>
        }
      />

      {icps.length === 0 ? (
        <Card>
          <EmptyState
            title="No ICPs yet"
            description="Create your first ideal customer profile to start matching leads."
            icon={<Target size={20} />}
            action={
              <Link href="/dashboard/icps/new">
                <Button variant="primary">
                  <Plus size={15} aria-hidden />
                  Create an ICP
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-scale-md-5 md:grid-cols-2 xl:grid-cols-3">
          {icps.map((icp) => (
            <Card key={icp.id} className="flex flex-col gap-scale-sm-4">
              <div className="flex flex-col gap-scale-sm-2">
                <div className="flex flex-wrap items-center gap-scale-sm-2">
                  <Link
                    href={`/dashboard/icps/${icp.id}`}
                    className="h6 underline-offset-2 hover:underline"
                  >
                    {icp.name}
                  </Link>
                  {icp.isActive ? (
                    <Badge tone="success">Active</Badge>
                  ) : (
                    <Badge tone="neutral">Paused</Badge>
                  )}
                </div>

                {icp.description ? (
                  <p className="para-text-xs text-[var(--text-secondary)]">
                    {icp.description}
                  </p>
                ) : null}
              </div>

              <dl className="grid grid-cols-2 gap-scale-sm-3">
                {[
                  { label: "Industries", value: icp.industries.length },
                  { label: "Countries", value: icp.countries.length },
                  { label: "Job titles", value: icp.jobTitles.length },
                  { label: "Exclusions", value: icp.exclusions.length },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-scale-sm-1 rounded-lg bg-[var(--muted)] px-scale-sm-3 py-scale-sm-2"
                  >
                    <dt className="para-text-xxs uppercase tracking-wider text-[var(--text-muted)]">
                      {item.label}
                    </dt>
                    <dd className="para-text-sm font-semibold text-[var(--text-primary)]">
                      {formatNumber(item.value)}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-auto flex items-center justify-between gap-scale-sm-3 border-t border-[var(--border)] pt-scale-sm-3">
                <span className="para-text-xxs text-[var(--text-muted)]">
                  {icp.lastMatchedAt
                    ? `Matched ${formatDateTime(icp.lastMatchedAt)}`
                    : "Never matched"}
                </span>
                <Link
                  href={`/dashboard/icps/${icp.id}`}
                  className="para-text-xs font-medium text-[var(--text-primary)] underline-offset-2 hover:underline"
                >
                  Open
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}