import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card } from "@/app/components/dashboard/Card";
import { CampaignList, type CampaignRow } from "@/app/components/dashboard/CampaignManager";
import Button from "@/app/components/ui/store/Button";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const user = await requireUser();

  const [campaigns, smtpCount, leadCount] = await Promise.all([
    prisma.campaign.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { leads: true } },
        emails: { select: { status: true } },
      },
    }),
    prisma.smtpAccount.count({ where: { userId: user.id } }),
    prisma.contact.count({
      where: {
        company: { leads: { some: { unlocks: { some: { userId: user.id } } } } },
      },
    }),
  ]);

  const rows: CampaignRow[] = campaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    subject: campaign.subject,
    scheduledAt: campaign.scheduledAt,
    createdAt: campaign.createdAt,
    recipientCount: campaign._count.leads,
    queuedCount: campaign.emails.filter((email) => email.status === "QUEUED").length,
    sentCount: campaign.emails.filter((email) =>
      ["SENT", "DELIVERED", "OPENED", "CLICKED", "REPLIED"].includes(email.status)
    ).length,
  }));

  const totalRecipients = rows.reduce((sum, row) => sum + row.recipientCount, 0);
  const totalSent = rows.reduce((sum, row) => sum + row.sentCount, 0);

  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Create, schedule and monitor outreach sent through your own SMTP."
              actions={
                <Link href="/dashboard/campaigns/new">
                  <Button variant="primary" icon={<Plus size={15} aria-hidden />}>
                    New campaign
                  </Button>
                </Link>
              }
            />

            {smtpCount === 0 ? (
              <div
                role="status"
                className="flex flex-wrap items-center justify-between gap-scale-sm-4 rounded-xl border border-[color-mix(in_srgb,var(--warning)_32%,transparent)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] px-scale-md-5 py-scale-sm-4"
              >
                <p className="para-text-sm text-[var(--text-secondary)]">
                  Connect an SMTP account before sending, otherwise the campaign cannot be
                  started.
                </p>
                <Link href="/dashboard/smtp">
                  <Button variant="outline">Connect SMTP</Button>
                </Link>
              </div>
            ) : null}

                        {leadCount === 0 ? (
              <div
                role="status"
                className="flex flex-wrap items-center justify-between gap-scale-sm-4 rounded-xl border border-[var(--border)] bg-[var(--muted)] px-scale-md-5 py-scale-sm-4"
              >
                <p className="para-text-sm text-[var(--text-secondary)]">
                  You have no unlocked leads yet. Unlock at least one lead before creating a
                  campaign.
                </p>
                <Link href="/dashboard/leads">
                  <Button variant="outline">Find leads</Button>
                </Link>
              </div>
            ) : null}

            <Card
              title="All campaigns"
              description={`${formatNumber(rows.length)} campaigns · ${formatNumber(totalRecipients)} recipients · ${formatNumber(totalSent)} sent`}
              padded={true}
            >
              <div className="p-scale-md-5">
                <CampaignList campaigns={rows} />
              </div>
            </Card>
    </>
  );
}