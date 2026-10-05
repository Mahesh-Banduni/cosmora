import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { SmtpManager, type SmtpRow } from "@/app/components/dashboard/SmtpManager";

export const dynamic = "force-dynamic";

export default async function SmtpPage() {
  const user = await requireUser();

  const accounts = await prisma.smtpAccount.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  const rows: SmtpRow[] = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    host: account.host,
    port: account.port,
    secure: account.secure,
    username: account.username,
    fromName: account.fromName,
    fromEmail: account.fromEmail,
    replyTo: account.replyTo,
    isDefault: account.isDefault,
    isVerified: account.isVerified,
    lastTestedAt: account.lastTestedAt,
    lastTestResult: account.lastTestResult,
  }));

  return (
    <>
      <PageHeader
        title="SMTP accounts"
        description="Connect your own email infrastructure. Passwords are encrypted at rest and never shown again."
      />

      <SmtpManager accounts={rows} />
    </>
  );
}