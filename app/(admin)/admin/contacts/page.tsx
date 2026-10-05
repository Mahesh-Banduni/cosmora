import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card, EmptyState } from "@/app/components/dashboard/Card";
import Button from "@/app/components/ui/store/Button";
import SearchInput from "@/app/components/ui/store/SearchInput";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/app/components/ui/store/Table";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import type { Prisma } from "@/lib/generated/prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const query = q?.trim() ?? "";
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where: Prisma.ContactWhereInput = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { jobTitle: { contains: query, mode: "insensitive" } },
          { company: { name: { contains: query, mode: "insensitive" } } },
        ],
      }
    : {};

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: { company: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.contact.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const previousHref = `/admin/contacts?q=${encodeURIComponent(query)}&page=${currentPage - 1}`;
  const nextHref = `/admin/contacts?q=${encodeURIComponent(query)}&page=${currentPage + 1}`;

  return (
    <div className="flex flex-col gap-scale-lg-8">
      <PageHeader
        title="Contacts"
        description="People attached to companies in the lead database."
        actions={
          <form method="get" className="flex items-center gap-scale-sm-2">
            <SearchInput name="q" defaultValue={query} />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        }
      />

      <Card padded={true}>
        {contacts.length === 0 ? (
          <EmptyState
            title="No contacts found"
            description={
              query
                ? "No contacts match your search. Try a different term."
                : "Import a lead file or add a contact from a company page."
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <span className="para-text-sm text-[var(--text-primary)]">
                      {[contact.firstName, contact.lastName]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </span>
                  </TableCell>
                  <TableCell>{contact.jobTitle || "—"}</TableCell>
                  <TableCell>
                    {contact.company?.id ? (
                      <a
                        href={`/admin/leads/${contact.company.id}`}
                        className="para-text-sm text-[var(--text-primary)] underline underline-offset-2"
                      >
                        {contact.company.name}
                      </a>
                    ) : (
                      <span className="para-text-sm text-[var(--text-muted)]">
                        —
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{contact.email || "—"}</TableCell>
                  <TableCell>{contact.phone || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <div className="flex items-center justify-between">
        {currentPage > 1 ? (
          <a
            href={previousHref}
            className="para-text-xs text-[var(--text-secondary)] underline underline-offset-2"
          >
            Previous
          </a>
        ) : (
          <span />
        )}
        <span className="para-text-xxs text-[var(--text-muted)]">
          {formatNumber(total)} contact{total === 1 ? "" : "s"} · page{" "}
          {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages ? (
          <a
            href={nextHref}
            className="para-text-xs text-[var(--text-secondary)] underline underline-offset-2"
          >
            Next
          </a>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
