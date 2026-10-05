import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card, StatCard, EmptyState, Badge } from "@/app/components/dashboard/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/store/Table";
import { Send, MailCheck, MailX, Eye, MousePointerClick, Reply, UserMinus } from "lucide-react";
import { formatNumber, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await requireUser();

  const [byStatus, campaigns, replies] = await Promise.all([
    prisma.emailQueue.groupBy({
      by: ["status"],
      where: { campaign: { userId: user.id } },
      _count: { _all: true },
    }),
    prisma.campaign.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { emails: { select: { status: true } } },
      take: 20,
    }),
    prisma.emailQueue.count({
      where: { campaign: { userId: user.id }, repliedAt: { not: null } },
    }),
  ]);

  const counts = Object.fromEntries(
    byStatus.map((row) => [row.status, row._count._all])
  );

  const sent =
    (counts.SENT ?? 0) +
    (counts.DELIVERED ?? 0) +
    (counts.OPENED ?? 0) +
    (counts.CLICKED ?? 0) +
    (counts.REPLIED ?? 0);

  const delivered =
    (counts.DELIVERED ?? 0) +
    (counts.OPENED ?? 0) +
    (counts.CLICKED ?? 0) +
    (counts.REPLIED ?? 0);
  const opened =
    (counts.OPENED ?? 0) + (counts.CLICKED ?? 0) + (counts.REPLIED ?? 0);
  const clicked = (counts.CLICKED ?? 0) + (counts.REPLIED ?? 0);

  const metrics = [
    { label: "Sent", value: sent, icon: <Send size={16} />, rate: undefined },
    { label: "Delivered", value: delivered, icon: <MailCheck size={16} />, rate: sent },
    { label: "Opened", value: opened, icon: <Eye size={16} />, rate: sent },
    { label: "Clicked", value: clicked, icon: <MousePointerClick size={16} />, rate: sent },
    { label: "Replied", value: counts.REPLIED ?? 0, icon: <Reply size={16} />, rate: sent },
    { label: "Bounced", value: counts.BOUNCED ?? 0, icon: <MailX size={16} />, rate: sent },
    {
      label: "Unsubscribed",
      value: counts.UNSUBSCRIBED ?? 0,
      icon: <UserMinus size={16} />,
      rate: sent,
    },
  ];

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Delivery and engagement across every campaign you have sent."
      />

      <div className="grid gap-scale-md-5 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.slice(0, 4).map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={formatNumber(metric.value)}
            hint={
              metric.rate !== undefined
                ? `${formatPercent(metric.rate, sent)} of sent`
                : "Total attempted"
            }
            icon={metric.icon}
          />
        ))}
      </div>

      <div className="grid gap-scale-md-5 sm:grid-cols-3">
        {metrics.slice(4).map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={formatNumber(metric.value)}
            hint={`${formatPercent(metric.rate ?? 0, sent)} of sent`}
            icon={metric.icon}
          />
        ))}
      </div>

      <Card
        title="Campaign performance"
        description="Delivery rates for your most recent campaigns."
        padded={true}
      >
        {campaigns.length === 0 ? (
          <div className="p-scale-md-6">
            <EmptyState
              title="No campaign data"
              description="Send a campaign to start collecting delivery and engagement data."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Clicked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const rows = campaign.emails;
                const cSent = rows.filter((email) =>
                  ["SENT", "DELIVERED", "OPENED", "CLICKED", "REPLIED"].includes(email.status)
                ).length;
                const cDelivered = rows.filter((email) =>
                  ["DELIVERED", "OPENED", "CLICKED", "REPLIED"].includes(email.status)
                ).length;
                const cOpened = rows.filter((email) =>
                  ["OPENED", "CLICKED", "REPLIED"].includes(email.status)
                ).length;
                const cClicked = rows.filter((email) =>
                  ["CLICKED", "REPLIED"].includes(email.status)
                ).length;

                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/campaigns/${campaign.id}`}
                        className="font-medium text-[var(--text-primary)] underline-offset-2 hover:underline"
                      >
                        {campaign.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        tone={campaign.status === "COMPLETED" ? "success" : "neutral"}
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{cSent}</TableCell>
                    <TableCell className="text-sm">
                      {cSent > 0 ? formatPercent(cDelivered, cSent) : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {cSent > 0 ? formatPercent(cOpened, cSent) : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {cSent > 0 ? formatPercent(cClicked, cSent) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <p className="para-text-xs text-[var(--text-muted)]">
        {replies} reply events recorded across all campaigns.
      </p>
    </>
  );
}