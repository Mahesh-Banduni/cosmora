import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card, StatCard, EmptyState, Badge } from "@/app/components/dashboard/Card";
import {
  Target,
  Users,
  Mail,
  Bookmark,
  TrendingUp,
  Coins,
} from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UserOverviewPage() {
  const user = await requireUser();

  const [icpCount, savedCount, campaignCount, ledger, emailStats, recentCampaigns] =
    await Promise.all([
      prisma.icp.count({ where: { userId: user.id } }),
      prisma.savedLead.count({ where: { userId: user.id } }),
      prisma.campaign.count({ where: { userId: user.id } }),
      prisma.creditTransaction.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { balanceAfter: true },
      }),
      prisma.emailQueue.groupBy({
        by: ["status"],
        where: { campaign: { userId: user.id } },
        _count: { _all: true },
      }),
      prisma.campaign.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          _count: { select: { emails: true } },
        },
      }),
    ]);

  const statusCounts = Object.fromEntries(
    emailStats.map((row) => [row.status, row._count._all])
  );

  const sent =
    (statusCounts.SENT ?? 0) +
    (statusCounts.DELIVERED ?? 0) +
    (statusCounts.OPENED ?? 0) +
    (statusCounts.CLICKED ?? 0) +
    (statusCounts.REPLIED ?? 0);

  const delivered = (statusCounts.DELIVERED ?? 0) + (statusCounts.OPENED ?? 0) +
    (statusCounts.CLICKED ?? 0) + (statusCounts.REPLIED ?? 0);
  const opened = (statusCounts.OPENED ?? 0) + (statusCounts.CLICKED ?? 0) +
    (statusCounts.REPLIED ?? 0);
  const clicked = (statusCounts.CLICKED ?? 0) + (statusCounts.REPLIED ?? 0);

  const campaignTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
    COMPLETED: "success",
    SENDING: "warning",
    PAUSED: "warning",
    CANCELLED: "danger",
    DRAFT: "neutral",
    SCHEDULED: "neutral",
  };

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Your lead matching, outreach and results in one place."
      />

      <div className="grid gap-scale-md-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Credits"
          value={formatNumber(ledger?.balanceAfter ?? 0)}
          hint="Available to unlock"
          icon={<Coins size={16} />}
        />
        <StatCard
          label="My ICPs"
          value={formatNumber(icpCount)}
          hint="Profiles to match against"
          icon={<Target size={16} />}
        />
        <StatCard
          label="Saved leads"
          value={formatNumber(savedCount)}
          hint="Bookmarked"
          icon={<Bookmark size={16} />}
        />
        <StatCard
          label="Campaigns"
          value={formatNumber(campaignCount)}
          hint="All time"
          icon={<Mail size={16} />}
        />
      </div>

      <div className="grid gap-scale-md-6 lg:grid-cols-3">
        <Card
          title="Campaign performance"
          description="Delivery and engagement across every campaign."
          className="lg:col-span-2"
        >
          <dl className="grid gap-scale-md-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Sent", value: sent },
              { label: "Delivered", value: delivered, rate: delivered },
              { label: "Opened", value: opened, rate: sent },
              { label: "Clicked", value: clicked, rate: sent },
            ].map((metric) => (
              <div
                key={metric.label}
                className="flex flex-col gap-scale-sm-2 rounded-xl border border-[var(--border)] p-scale-md-4"
              >
                <dt className="para-text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  {metric.label}
                </dt>
                <dd className="text-[26px] font-semibold leading-none text-[var(--text-primary)]">
                  {formatNumber(metric.value)}
                </dd>
                {metric.rate !== undefined ? (
                  <dd className="para-text-xxs text-[var(--text-muted)]">
                    {formatPercent(metric.rate, sent)} of sent
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Get started" className="lg:col-span-1">
          <ul className="flex flex-col gap-scale-sm-4">
            {[
              {
                href: "/dashboard/icps/new",
                title: "Describe your ICP",
                body: "Plain language is enough — AI turns it into filters.",
              },
              {
                href: "/dashboard/leads",
                title: "Match and unlock leads",
                body: "Spend credits to reveal full contact details.",
              },
              {
                href: "/dashboard/smtp",
                title: "Connect your SMTP",
                body: "Send from your own infrastructure.",
              },
            ].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex flex-col gap-scale-sm-1.5 rounded-xl border border-[var(--border)] p-scale-sm-4 transition hover:border-[var(--brand)] hover:bg-[var(--surface-hover)]"
                >
                  <span className="flex items-center gap-scale-sm-2 para-text-sm font-medium text-[var(--text-primary)]">
                    <TrendingUp size={15} aria-hidden />
                    {item.title}
                  </span>
                  <span className="para-text-xxs text-[var(--text-secondary)]">
                    {item.body}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Recent campaigns"
        description="Your latest outreach."
        padded={true}
      >
        {recentCampaigns.length === 0 ? (
          <div className="p-scale-md-6">
            <EmptyState
              title="No campaigns yet"
              description="Create a campaign and pick leads to start reaching out."
              icon={<Users size={20} />}
            />
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {recentCampaigns.map((campaign) => (
              <li
                key={campaign.id}
                className="flex flex-wrap items-center justify-between gap-scale-sm-3 px-scale-md-6 py-scale-sm-4"
              >
                <div className="flex min-w-0 flex-col gap-scale-sm-1">
                  <a
                    href={`/dashboard/campaigns/${campaign.id}`}
                    className="truncate para-text-sm font-medium text-[var(--text-primary)] underline-offset-2 hover:underline"
                  >
                    {campaign.name}
                  </a>
                  <span className="para-text-xxs text-[var(--text-muted)]">
                    {formatNumber(campaign._count.emails)} queued emails
                  </span>
                </div>
                <Badge tone={campaignTone[campaign.status] ?? "neutral"}>
                  {campaign.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}