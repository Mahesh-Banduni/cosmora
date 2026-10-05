import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/app/components/dashboard/PageHeader";
import {
  CampaignComposer,
  type SelectableLead,
  type SelectableSmtp,
  type SelectableTemplate,
} from "@/app/components/dashboard/CampaignComposer";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  const user = await requireUser();

  const [contacts, smtpAccounts, templates] = await Promise.all([
    prisma.contact.findMany({
      // Only contacts whose lead this user has unlocked are selectable.
      where: {
        company: { leads: { some: { unlocks: { some: { userId: user.id } } } } },
      },
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.smtpAccount.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    }),
    prisma.emailTemplate.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, subject: true, htmlBody: true, mode: true },
    }),
  ]);

  const leads: SelectableLead[] = contacts.map((contact) => ({
    contactId: contact.id,
    contactName: `${contact.firstName} ${contact.lastName}`,
    email: contact.email,
    jobTitle: contact.jobTitle,
    companyName: contact.company?.name ?? "Unknown company",
  }));

  const accounts: SelectableSmtp[] = smtpAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    fromEmail: account.fromEmail,
    isDefault: account.isDefault,
    isVerified: account.isVerified,
  }));

  const savedTemplates: SelectableTemplate[] = templates.map((template) => ({
    id: template.id,
    name: template.name,
    subject: template.subject,
    htmlBody: template.htmlBody,
    mode: template.mode,
  }));

  return (
    <>
      <PageHeader
        title="New campaign"
        description="Compose an email, pick leads, choose an SMTP account, then schedule or send."
        breadcrumb={[
          { label: "Campaigns", href: "/dashboard/campaigns" },
          { label: "New" },
        ]}
      />

      <CampaignComposer
        leads={leads}
        smtpAccounts={accounts}
        templates={savedTemplates}
        defaultSubject=""
        defaultHtml=""
      />
    </>
  );
}