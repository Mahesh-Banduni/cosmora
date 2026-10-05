import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card, Badge, EmptyState } from "@/app/components/dashboard/Card";
import ImportLeadsForm from "@/app/components/admin/ImportLeadsForm";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminImportsPage() {
  const jobs = await prisma.importJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="flex flex-col gap-scale-lg-8">
      <PageHeader
        title="Import leads"
        description="Upload a CSV or Excel export and Cosmora will create companies and contacts, skipping duplicates automatically."
      />

      <ImportLeadsForm />

      <Card title="Import history" padded={true}>
        {jobs.length === 0 ? (
          <EmptyState
            title="No imports yet"
            description="Upload a CSV or Excel export to populate the database."
          />
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-scale-sm-3 px-scale-md-4 py-scale-md-3"
              >
                <div className="flex flex-col">
                  <span className="para-text-sm font-medium text-[var(--text-primary)]">
                    {job.fileName}
                  </span>
                  <span className="para-text-xxs text-[var(--text-muted)]">
                    {formatDateTime(job.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-scale-sm-3">
                  <span className="para-text-xxs text-[var(--text-muted)]">
                    {job.importedRows}/{job.totalRows} rows ·{" "}
                    {job.duplicateRows} duplicates
                  </span>
                  <Badge
                    tone={
                      job.status === "COMPLETED"
                        ? "success"
                        : job.status === "PROCESSING"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {job.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
