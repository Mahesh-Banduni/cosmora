import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card, StatCard, Badge, EmptyState } from "@/app/components/dashboard/Card";
import { CampaignControls } from "@/app/components/dashboard/CampaignManager";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/store/Table";
import { Mail, Send, MousePointerClick, Reply } from "lucide-react";
import { formatDateTime, formatNumber, formatPercent } from "@/lib/utils";

export const dynamic = "force-dynamic";

const emailTone: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  SENT: "neutral",
  DELIVERED: "success",
  OPENED: "success",
  CLICKED: "success",
  REPLIED: "success",
  BOUNCED: "danger",
  FAILED: "danger",
  UNSUBSCRIBED: "warning",
  QUEUED: "neutral",
  SENDING: "warning",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: user.id },
    include: {
      smtpAccount: { select: { name: true, fromEmail: true, isVerified: true } },
      emails: { orderBy: { createdAt: "desc" }, take: 50 },
      _count: { select: { leads: true } },
    },
  });

  if (!campaign) notFound();

  const countStatus = (status: string) =>
    campaign.emails.filter((email) => email.status === status).length;

  const sent = campaign.emails.filter((email) =>
    ["SENT", "DELIVERED", "OPENED", "CLICKED", "REPLIED"].includes(email.status)
  ).length;
  const delivered = campaign.emails.filter((email) =>
    ["DELIVERED", "OPENED", "CLICKED", "REPLIED"].includes(email.status)
  ).length;
  const opened = campaign.emails.filter((email) =>
    ["OPENED", "CLICKED", "REPLIED"].includes(email.status)
  ).length;
  const clicked = campaign.emails.filter((email) =>
    ["CLICKED", "REPLIED"].includes(email.status)
  ).length;
  const bounced = countStatus("BOUNCED");

  return (
    <>
      <PageHeader
        title={campaign.name}
        description={campaign.description ?? "Outreach campaign"}
        breadcrumb={[
          { label: "Campaigns", href: "/dashboard/campaigns" },
          { label: campaign.name },
        ]}
      />

      <div className="flex flex-wrap items-center gap-scale-sm-3">
        <Badge
          tone={
            campaign.status === "COMPLETED"
              ? "success"
              : campaign.status === "SENDING" || campaign.status === "PAUSED"
                ? "warning"
                : "neutral"
          }
        >
          {campaign.status}
        </Badge>
        {campaign.smtpAccount ? (
          <Badge tone={campaign.smtpAccount.isVerified ? "success" : "warning"}>
            {campaign.smtpAccount.name} · {campaign.smtpAccount.fromEmail}
          </Badge>
        ) : (
          <Badge tone="danger">No SMTP connected</Badge>
        )}
      </div>

      <Card title="Sending controls" description="Start, pause, schedule or cancel this campaign.">
        <CampaignControls campaignId={campaign.id} status={campaign.status} />
      </Card>

      <div className="grid gap-scale-md-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Recipients"
          value={formatNumber(campaign._count.leads)}
          hint="Leads selected"
          icon={<Mail size={16} />}
        />
        <StatCard
          label="Sent"
          value={formatNumber(sent)}
          hint={`${formatPercent(delivered, sent)} delivered`}
          icon={<Send size={16} />}
        />
        <StatCard
          label="Opened"
          value={formatNumber(opened)}
          hint={`${formatPercent(opened, sent)} open rate`}
          icon={<MousePointerClick size={16} />}
        />
        <StatCard
          label="Bounced"
          value={formatNumber(bounced)}
          hint={bounced > 0 ? "Auto-suppressed" : "Clean"}
          icon={<Reply size={16} />}
        />
      </div>

      <Card
        title="Email log"
        description="The 50 most recent messages in this campaign."
        padded={true}
      >
        {campaign.emails.length === 0 ? (
          <div className="p-scale-md-6">
            <EmptyState
              title="No emails queued"
              description="Start the campaign to queue messages for each selected lead."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Opened</TableHead>
                <TableHead>Clicked</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaign.emails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell className="text-sm text-[var(--text-primary)]">
                    {email.emailAddress}
                  </TableCell>
                  <TableCell>
                    <Badge tone={emailTone[email.status] ?? "neutral"}>
                      {email.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {email.sentAt ? formatDateTime(email.sentAt) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {email.openedAt ? formatDateTime(email.openedAt) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {email.clickedAt ? formatDateTime(email.clickedAt) : "—"}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-sm">
                    {email.lastError ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {campaign.htmlBody ? (
        <Card
          title="Email preview"
          description="Personalized with merge tokens in place."
          actions={
            <Link
              href="/dashboard/builder"
              className="para-text-xs underline-offset-2 hover:underline"
            >
              Open in builder
            </Link>
          }
        >
          <div
            className="overflow-hidden rounded-xl border border-[var(--border)]"
            style={{ height: "460px" }}
          >
            <iframe
              title="Campaign email preview"
              srcDoc={campaign.htmlBody}
              className="h-full w-full border-0 bg-white"
            />
          </div>
        </Card>
      ) : null}
    </>
  );
}