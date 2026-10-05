import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card, Badge } from "@/app/components/dashboard/Card";
import { IcpRunPanel } from "@/app/components/dashboard/IcpRunPanel";
import { formatDateTime, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IcpDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const icp = await prisma.icp.findFirst({
    where: { id, userId: user.id },
    include: {
      _count: { select: { matches: true, scores: true } },
    },
  });

  if (!icp) notFound();

  const filters = [
    { label: "Industries", values: icp.industries },
    { label: "Countries", values: icp.countries },
    { label: "States", values: icp.states },
    { label: "Cities", values: icp.cities },
    { label: "Job titles", values: icp.jobTitles },
    { label: "Technologies", values: icp.technologies },
    { label: "Keywords", values: icp.keywords },
    { label: "Exclusions", values: icp.exclusions },
  ].filter((group) => group.values.length > 0);

  const numeric = [
    { label: "Min employees", value: icp.sizeMin },
    { label: "Max employees", value: icp.sizeMax },
    {
      label: "Min revenue",
      value: icp.revenueMin !== null ? Number(icp.revenueMin) : null,
    },
    {
      label: "Max revenue",
      value: icp.revenueMax !== null ? Number(icp.revenueMax) : null,
    },
  ].filter((item) => item.value !== null);

  return (
    <>
      <PageHeader
        title={icp.name}
        description={icp.description ?? "Ideal customer profile"}
        breadcrumb={[
          { label: "My ICPs", href: "/dashboard/icps" },
          { label: icp.name },
        ]}
        actions={
          <Link
            href="/dashboard/leads"
            className="para-text-sm underline-offset-2 hover:underline"
          >
            View matched leads
          </Link>
        }
      />

      {icp.naturalLanguageRequirements ? (
        <Card title="Original requirements" description="How this profile was described.">
          <p className="para-text-sm whitespace-pre-line text-[var(--text-secondary)]">
            {icp.naturalLanguageRequirements}
          </p>
        </Card>
      ) : null}

      <IcpRunPanel
        icpId={icp.id}
        matchCount={icp._count.matches}
        lastMatchedAt={
          icp.lastMatchedAt ? formatDateTime(icp.lastMatchedAt) : null
        }
      />

      <div className="grid gap-scale-md-6 lg:grid-cols-3">
        <Card
          title="Match criteria"
          description="Filters applied to the lead database."
          className="lg:col-span-2"
        >
          {filters.length === 0 && numeric.length === 0 ? (
            <p className="para-text-sm text-[var(--text-muted)]">
              No criteria configured. Matching will rank leads on data completeness.
            </p>
          ) : (
            <div className="flex flex-col gap-scale-md-5">
              <div className="grid gap-scale-md-5 sm:grid-cols-2">
                {filters.map((group) => (
                  <div key={group.label} className="flex flex-col gap-scale-sm-2">
                    <p className="para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
                      {group.label}
                    </p>
                    <ul className="flex flex-wrap gap-scale-sm-1.5">
                      {group.values.map((value) => (
                        <li key={value}>
                          <Badge tone={group.label === "Exclusions" ? "danger" : "brand"}>
                            {value}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {numeric.length > 0 ? (
                <dl className="grid gap-scale-sm-4 sm:grid-cols-4">
                  {numeric.map((item) => (
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
              ) : null}
            </div>
          )}
        </Card>

        <Card title="Summary" className="lg:col-span-1">
          <dl className="flex flex-col gap-scale-sm-4">
            {[
              { label: "Status", value: icp.isActive ? "Active" : "Paused" },
              { label: "Matched companies", value: formatNumber(icp._count.matches) },
              { label: "Scored leads", value: formatNumber(icp._count.scores) },
              { label: "Total match runs", value: formatNumber(icp.matchCount) },
              { label: "Created", value: formatDateTime(icp.createdAt) },
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
    </>
  );
}