import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card } from "@/app/components/dashboard/Card";
import {
  CreateCompanyForm,
  LeadsTable,
  type CompanyRow,
} from "@/app/components/admin/LeadsTable";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const query = q?.trim() ?? "";
  const currentPage = Math.max(1, Number(page ?? 1) || 1);

  const where: Prisma.CompanyWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { domain: { contains: query, mode: "insensitive" } },
          { industry: { contains: query, mode: "insensitive" } },
          { country: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      include: { _count: { select: { contacts: true } } },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.company.count({ where }),
  ]);

  const rows: CompanyRow[] = companies.map((company) => ({
    id: company.id,
    name: company.name,
    domain: company.domain,
    industry: company.industry,
    country: company.country,
    employeeCount: company.employeeCount,
    status: company.status,
    isVerified: company.isVerified,
    qualityScore: company.qualityScore,
    contactCount: company._count.contacts,
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Lead database"
        description="Every company in the master database. Availability here decides what users can match against."
        actions={<CreateCompanyForm />}
      />

      <Card>
        <LeadsTable companies={rows} query={query} />
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-scale-sm-3">
        <span className="para-text-xs text-[var(--text-muted)]">
          Showing {rows.length} of {formatNumber(total)} companies
        </span>

        <nav className="flex items-center gap-scale-sm-2" aria-label="Pagination">
          {currentPage > 1 ? (
            <a
              href={`/admin/leads?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
              className="rounded-lg border border-[var(--border)] px-scale-sm-3 py-scale-sm-2 para-text-xs hover:bg-[var(--surface-hover)]"
            >
              Previous
            </a>
          ) : null}

          <span className="para-text-xs text-[var(--text-secondary)]">
            Page {currentPage} of {totalPages}
          </span>

          {currentPage < totalPages ? (
            <a
              href={`/admin/leads?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
              className="rounded-lg border border-[var(--border)] px-scale-sm-3 py-scale-sm-2 para-text-xs hover:bg-[var(--surface-hover)]"
            >
              Next
            </a>
          ) : null}
        </nav>
      </div>
    </>
  );
}