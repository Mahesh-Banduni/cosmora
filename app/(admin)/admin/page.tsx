import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card, StatCard, EmptyState } from "@/app/components/dashboard/Card";
import { Badge } from "@/app/components/dashboard/Card";
import {
  Building2,
  Users,
  Database,
  Mail,
  TrendingUp,
  Activity,
} from "lucide-react";
import { formatNumber, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    companyCount,
    contactCount,
    userCount,
    verifiedCount,
    unlockedCount,
    campaignCount,
    statusBreakdown,
    recentImports,
    topCompanies,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.contact.count(),
    prisma.user.count(),
    prisma.company.count({ where: { isVerified: true } }),
    prisma.leadUnlock.count(),
    prisma.campaign.count(),
    prisma.company.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.importJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        fileName: true,
        status: true,
        importedRows: true,
        totalRows: true,
        createdAt: true,
      },
    }),
    prisma.company.findMany({
      orderBy: { qualityScore: "desc" },
      take: 5,
      select: { id: true, name: true, industry: true, qualityScore: true, isVerified: true },
    }),
  ]);

  const statusTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
    AVAILABLE: "success",
    RESERVED: "warning",
    LOCKED: "danger",
    ARCHIVED: "neutral",
  };

  return (
    <>
      <PageHeader
        title="Admin overview"
        description="Health of the lead database and the outreach running on top of it."
      />

      <div className="grid gap-scale-md-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Companies"
          value={formatNumber(companyCount)}
          hint={`${formatNumber(verifiedCount)} verified`}
          icon={<Building2 size={16} />}
        />
        <StatCard
          label="Contacts"
          value={formatNumber(contactCount)}
          hint="Across all companies"
          icon={<Users size={16} />}
        />
        <StatCard
          label="Lead unlocks"
          value={formatNumber(unlockedCount)}
          hint="Credits consumed"
          icon={<Database size={16} />}
        />
        <StatCard
          label="Campaigns"
          value={formatNumber(campaignCount)}
          hint="All users"
          icon={<Mail size={16} />}
        />
      </div>

      <div className="grid gap-scale-md-6 lg:grid-cols-3">
        <Card
          title="Lead availability"
          description="Controls which companies users can see."
          className="lg:col-span-1"
        >
          <ul className="flex flex-col gap-scale-sm-3">
            {statusBreakdown.length === 0 ? (
              <li className="para-text-sm text-[var(--text-muted)]">No companies yet.</li>
            ) : (
              statusBreakdown.map((row) => (
                <li
                  key={row.status}
                  className="flex items-center justify-between gap-scale-sm-3"
                >
                  <Badge tone={statusTone[row.status] ?? "neutral"}>{row.status}</Badge>
                  <span className="para-text-sm font-medium text-[var(--text-primary)]">
                    {formatNumber(row._count._all)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Card>

        <Card
          title="Top rated companies"
          description="Highest quality scores in the database."
          className="lg:col-span-2"
        >
          {topCompanies.length === 0 ? (
            <EmptyState
              title="No companies yet"
              description="Import leads or add a company manually to get started."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--border)]">
              {topCompanies.map((company) => (
                <li
                  key={company.id}
                  className="flex items-center justify-between gap-scale-sm-4 py-scale-sm-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 flex-col gap-scale-sm-1">
                    <span className="truncate para-text-sm font-medium text-[var(--text-primary)]">
                      {company.name}
                    </span>
                    <span className="truncate para-text-xxs text-[var(--text-muted)]">
                      {company.industry ?? "Industry not set"}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-scale-sm-3">
                    <Badge tone={company.isVerified ? "success" : "neutral"}>
                      {company.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                    <span className="para-text-sm font-semibold text-[var(--text-primary)]">
                      {company.qualityScore}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="Recent imports"
        description="Latest lead files processed."
        padded={true}
      >
        {recentImports.length === 0 ? (
          <div className="p-scale-md-6">
            <EmptyState
              title="No imports yet"
              description="Upload a CSV or Excel export to populate the database."
              icon={<Activity size={20} />}
            />
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {recentImports.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-scale-sm-3 px-scale-md-6 py-scale-sm-4"
              >
                <div className="flex min-w-0 flex-col gap-scale-sm-1">
                  <span className="truncate para-text-sm font-medium text-[var(--text-primary)]">
                    {job.fileName}
                  </span>
                  <span className="para-text-xxs text-[var(--text-muted)]">
                    {formatDateTime(job.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-scale-sm-3">
                  <Badge tone={job.status === "COMPLETED" ? "success" : "warning"}>
                    {job.status}
                  </Badge>
                  <span className="para-text-sm text-[var(--text-secondary)]">
                    {job.importedRows}/{job.totalRows} rows
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="What to do next" className="lg:col-span-3">
        <ul className="grid gap-scale-sm-4 sm:grid-cols-3">
          {[
            {
              href: "/admin/imports",
              title: "Import lead data",
              body: "Upload a CSV or Excel export. Duplicates are detected automatically.",
            },
            {
              href: "/admin/users",
              title: "Create user accounts",
              body: "Add reps and allocate the credits they can spend on lead unlocks.",
            },
            {
              href: "/admin/leads",
              title: "Review lead availability",
              body: "Lock companies that should not be matched, or verify data quality.",
            },
          ].map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="flex h-full flex-col gap-scale-sm-2 rounded-xl border border-[var(--border)] p-scale-md-4 transition hover:border-[var(--brand)] hover:bg-[var(--surface-hover)]"
              >
                <span className="flex items-center gap-scale-sm-2 h7">
                  <TrendingUp size={16} aria-hidden />
                  {item.title}
                </span>
                <span className="para-text-xs text-[var(--text-secondary)]">
                  {item.body}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}