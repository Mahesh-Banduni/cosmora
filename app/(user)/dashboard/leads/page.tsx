import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card } from "@/app/components/dashboard/Card";
import { LeadsExplorer, type LeadRow } from "@/app/components/dashboard/LeadsExplorer";
import { getCreditBalance } from "@/app/actions/leads";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await requireUser();
  const { q, status } = await searchParams;
  const query = q?.trim() ?? "";

  const where: Prisma.LeadWhereInput = {
    // Only companies the admin has made available are ever visible.
    company: {
      status: { in: ["AVAILABLE", "RESERVED"] },
    },
    ...(status && status !== "ALL"
      ? { status: status as Prisma.LeadWhereInput["status"] }
      : {}),
    ...(query
      ? {
          OR: [
            { company: { name: { contains: query, mode: "insensitive" } } },
            { company: { industry: { contains: query, mode: "insensitive" } } },
            { company: { country: { contains: query, mode: "insensitive" } } },
            { company: { city: { contains: query, mode: "insensitive" } } },
            { company: { domain: { contains: query, mode: "insensitive" } } },
            { contact: { email: { contains: query, mode: "insensitive" } } },
            { contact: { firstName: { contains: query, mode: "insensitive" } } },
            { contact: { lastName: { contains: query, mode: "insensitive" } } },
            { contact: { jobTitle: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [leads, total, credits] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        company: true,
        contact: true,
        scores: {
          orderBy: { score: "desc" },
          take: 1,
          include: { icp: { select: { id: true, name: true } } },
        },
        savedBy: { where: { userId: user.id }, select: { id: true } },
        tags: { where: { userId: user.id } },
        notes: {
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
    getCreditBalance(user.id),
  ]);

  const rows: LeadRow[] = leads.map((lead) => {
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
        id: lead.company?.id ?? "",
        name: lead.company?.name ?? "Unknown company",
        domain: lead.company?.domain ?? null,
        industry: lead.company?.industry ?? null,
        country: lead.company?.country ?? null,
        state: lead.company?.state ?? null,
        city: lead.company?.city ?? null,
        employeeCount: lead.company?.employeeCount ?? null,
        website: lead.company?.website ?? null,
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
      isSaved: lead.savedBy.length > 0,
      tags: lead.tags.map((tag) => ({ name: tag.name, color: tag.color })),
      notes: lead.notes.map((note) => ({ id: note.id, body: note.body })),
      // Contact details stay hidden until the user spends a credit.
      contact:
        lead.availability === "UNLOCKED"
          ? lead.contact
            ? {
                id: lead.contact.id,
                firstName: lead.contact.firstName,
                lastName: lead.contact.lastName,
                jobTitle: lead.contact.jobTitle,
                email: lead.contact.email,
                phone: lead.contact.phone,
                linkedinUrl: lead.contact.linkedinUrl,
              }
            : null
          : null,
    };
  });

  return (
    <>
      <PageHeader
        title="Match leads"
        description="Every lead here passed your ICP and is available to you. Unlock a lead to reveal full contact details."
      />

      <Card>
        <LeadsExplorer
          leads={rows}
          credits={credits}
          query={query}
          filter={status ?? "ALL"}
        />
      </Card>

      <p className="para-text-xs text-[var(--text-muted)]">
        Showing {formatNumber(rows.length)} of {formatNumber(total)} available leads.
      </p>
    </>
  );
}