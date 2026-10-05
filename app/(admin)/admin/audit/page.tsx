import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card, Badge, EmptyState } from "@/app/components/dashboard/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/store/Table";
import { ScrollText } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireAdmin();
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page ?? 1) || 1);
  const PAGE_SIZE = 50;

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every administrative and automated action recorded on the platform."
      />

      <Card padded={true}>
        {entries.length === 0 ? (
          <div className="p-scale-md-6">
            <EmptyState
              title="No activity yet"
              description="Administrative actions will appear here as the platform is used."
              icon={<ScrollText size={20} />}
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDateTime(entry.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.user?.name ?? "System"}
                  </TableCell>
                  <TableCell>
                    <Badge tone="neutral">{entry.action}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {entry.entityType}
                    {entry.entityId ? (
                      <span className="block para-text-xxs text-[var(--text-muted)]">
                        {entry.entityId}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate text-sm">
                    {entry.metadata ? JSON.stringify(entry.metadata) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <nav className="flex items-center justify-between gap-scale-sm-3" aria-label="Pagination">
        {currentPage > 1 ? (
          <a
            href={`/admin/audit?page=${currentPage - 1}`}
            className="rounded-lg border border-[var(--border)] px-scale-sm-3 py-scale-sm-2 para-text-xs hover:bg-[var(--surface-hover)]"
          >
            Previous
          </a>
        ) : (
          <span />
        )}

        <span className="para-text-xs text-[var(--text-secondary)]">
          Page {currentPage} of {totalPages}
        </span>

        {currentPage < totalPages ? (
          <a
            href={`/admin/audit?page=${currentPage + 1}`}
            className="rounded-lg border border-[var(--border)] px-scale-sm-3 py-scale-sm-2 para-text-xs hover:bg-[var(--surface-hover)]"
          >
            Next
          </a>
        ) : (
          <span />
        )}
      </nav>
    </>
  );
}