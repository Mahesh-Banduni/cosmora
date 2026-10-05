import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import {
  SuppressionManager,
  type SuppressionRow,
} from "@/app/components/admin/SuppressionManager";

export const dynamic = "force-dynamic";

export default async function CompliancePage() {
  await requireAdmin();

  const entries = await prisma.suppression.findMany({
    orderBy: { createdAt: "desc" },
    take: 250,
  });

  const rows: SuppressionRow[] = entries.map((entry) => ({
    email: entry.email,
    reason: entry.reason,
    source: entry.source,
    createdAt: entry.createdAt,
  }));

  return (
    <>
      <PageHeader
        title="Compliance"
        description="The suppression list is checked before every send, so these addresses can never be contacted again."
      />

      <SuppressionManager entries={rows} />
    </>
  );
}