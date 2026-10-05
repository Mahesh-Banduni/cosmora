import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card, EmptyState, Badge } from "@/app/components/dashboard/Card";
import { LeadsExplorer, type LeadRow } from "@/app/components/dashboard/LeadsExplorer";
import { getCreditBalance } from "@/app/actions/leads";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SavedLeadsPage() {
  const user = await requireUser();

  const [saved, total, credits] = await Promise.all([
    prisma.savedLead.findMany({
      where: { userId: user.id },
      include: {
        lead: {
          include: {
            company: true,
            contact: true,
            scores: {
              orderBy: { score: "desc" },
              take: 1,
              include: { icp: { select: { id: true, name: true } } },
            },
            tags: { where: { userId: user.id } },
            notes: { where: { userId: user.id }, orderBy: { createdAt: "desc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.savedLead.count({ where: { userId: user.id } }),
    getCreditBalance(user.id),
  ]);

  const rows: LeadRow[] = saved
    .filter((entry) => entry.lead.company)
    .map((entry) => {
      const lead = entry.lead;
      const topScore = lead.scores[0] ?? null;
      const breakdown = topScore?.breakdown as
        | { matchedCriteria?: string[] }
        | null
        | undefined;

      return {
        id: lead.id,
        availability: lead.availability,
        status: lead.status,
        company: {
          id: lead.company!.id,
          name: lead.company!.name,
          domain: lead.company!.domain,
          industry: lead.company!.industry,
          country: lead.company!.country,
          state: lead.company!.state,
          city: lead.company!.city,
          employeeCount: lead.company!.employeeCount,
          website: lead.company!.website,
        },
        contactPreview: lead.contact
          ? {
              name: `${lead.contact.firstName} ${lead.contact.lastName}`,
              jobTitle: lead.contact.jobTitle,
            }
          : null,
        score: topScore?.score ?? null,
        icpId: topScore?.icp.id ?? null,
        icpName: topScore?.icp.name ?? null,
        explanation: topScore?.explanation ?? null,
        matchedCriteria: breakdown?.matchedCriteria ?? [],
        isSaved: true,
        tags: lead.tags.map((tag) => ({ name: tag.name, color: tag.color })),
        notes: lead.notes.map((note) => ({ id: note.id, body: note.body })),
        contact:
          lead.availability === "UNLOCKED" && lead.contact
            ? {
                id: lead.contact.id,
                firstName: lead.contact.firstName,
                lastName: lead.contact.lastName,
                jobTitle: lead.contact.jobTitle,
                email: lead.contact.email,
                phone: lead.contact.phone,
                linkedinUrl: lead.contact.linkedinUrl,
              }
            : null,
      };
    });

  return (
    <>
      <PageHeader
        title="Saved leads"
        description="Leads you bookmarked, with their tags, notes and match scores."
      />

      <Card>
        {rows.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            description="Save leads from the match list to keep them close."
          />
        ) : (
          <LeadsExplorer leads={rows} credits={credits} query="" filter="ALL" />
        )}
      </Card>

      <p className="para-text-xs text-[var(--text-muted)]">
        {formatNumber(rows.length)} of {formatNumber(total)} saved leads shown.
      </p>
    </>
  );
}