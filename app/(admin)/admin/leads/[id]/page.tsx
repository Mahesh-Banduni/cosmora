import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { PageHeader } from "@/app/components/dashboard/PageHeader";
import { Card, Badge, EmptyState } from "@/app/components/dashboard/Card";
import CompanyEditForm from "@/app/components/admin/CompanyEditForm";
import CategoryAssignmentForm from "@/app/components/admin/CategoryAssignmentForm";
import AddContactForm from "@/app/components/admin/AddContactForm";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-scale-sm-1 border-b border-[var(--border)] py-scale-sm-3 last:border-b-0">
      <dt className="para-text-xxs text-[var(--text-muted)]">{label}</dt>
      <dd className="para-text-sm text-[var(--text-primary)]">{children}</dd>
    </div>
  );
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { createdAt: "desc" } },
      categoryIds: true,
    },
  });

  if (!company) {
    notFound();
  }

  const allCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const description = [
    company.industry,
    [company.city, company.state, company.country].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" · ");

  const location =
    [company.city, company.state, company.country].filter(Boolean).join(", ") ||
    "—";

  const revenueMin =
    company.revenueMin != null ? Number(company.revenueMin) : null;
  const revenueMax =
    company.revenueMax != null ? Number(company.revenueMax) : null;
  const revenue =
    revenueMin != null || revenueMax != null
      ? `${formatCurrency(revenueMin)} – ${formatCurrency(revenueMax)}`
      : "—";

  const technologies = company.technologies.filter(Boolean).join(", ") || "—";
  const keywords = company.keywords.filter(Boolean).join(", ") || "—";
  const selectedCategoryIds = company.categoryIds.map(
    (link) => link.categoryId,
  );

  return (
    <div className="flex flex-col gap-scale-lg-8">
      <PageHeader
        breadcrumb={[
          { label: "Lead database", href: "/admin/leads" },
          { label: company.name },
        ]}
        title={company.name}
        description={description || "Company in the lead database."}
        actions={
          <div className="flex items-center gap-scale-sm-3">
            {company.isVerified ? (
              <Badge tone="success">
                <ShieldCheck className="size-3" />
                Verified
              </Badge>
            ) : (
              <Badge tone="neutral">Unverified</Badge>
            )}
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="para-text-xs text-[var(--text-secondary)] underline underline-offset-2"
              >
                Visit website
              </a>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-scale-md-6 lg:grid-cols-3">
        <Card title="Company details" className="lg:col-span-1">
          <dl className="flex flex-col">
            <DetailRow label="Domain">{company.domain || "—"}</DetailRow>
            <DetailRow label="Website">
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {company.website}
                </a>
              ) : (
                "—"
              )}
            </DetailRow>
            <DetailRow label="Industry">{company.industry || "—"}</DetailRow>
            <DetailRow label="Employees">
              {company.employeeCount != null
                ? formatNumber(company.employeeCount)
                : "—"}
            </DetailRow>
            <DetailRow label="Revenue">{revenue}</DetailRow>
            <DetailRow label="Location">{location}</DetailRow>
            <DetailRow label="Technologies">{technologies}</DetailRow>
            <DetailRow label="Keywords">{keywords}</DetailRow>
            {company.description ? (
              <DetailRow label="Description">{company.description}</DetailRow>
            ) : null}
          </dl>
        </Card>

        <div className="lg:col-span-2">
          <CompanyEditForm
            company={{
              id: company.id,
              name: company.name,
              domain: company.domain,
              industry: company.industry,
              website: company.website,
              employeeCount: company.employeeCount,
              country: company.country,
              state: company.state,
              city: company.city,
              revenueMin,
              revenueMax,
              technologies: company.technologies.length
                ? company.technologies.join(", ")
                : null,
              keywords: company.keywords.length
                ? company.keywords.join(", ")
                : null,
              description: company.description,
              isVerified: company.isVerified,
            }}
          />
        </div>

        <Card title="Categories">
          <CategoryAssignmentForm
            companyId={company.id}
            categories={allCategories.map((category) => ({
              id: category.id,
              name: category.name,
              description: category.description,
            }))}
            selectedCategoryIds={selectedCategoryIds}
          />
        </Card>

        <Card title="Contacts" padded={true} className="lg:col-span-3">
          {company.contacts.length === 0 ? (
            <EmptyState
              title="No contacts yet"
              description="Add the first decision maker at this company."
            />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {company.contacts.map((contact) => (
                <li
                  key={contact.id}
                  className="flex flex-wrap items-center justify-between gap-scale-sm-3 px-scale-md-4 py-scale-md-3"
                >
                  <div className="flex flex-col">
                    <span className="para-text-sm font-medium text-[var(--text-primary)]">
                      {[contact.firstName, contact.lastName]
                        .filter(Boolean)
                        .join(" ") || "Unnamed contact"}
                    </span>
                    {contact.jobTitle ? (
                      <span className="para-text-xxs text-[var(--text-muted)]">
                        {contact.jobTitle}
                      </span>
                    ) : null}
                  </div>
                  <span className="para-text-xs text-[var(--text-secondary)]">
                    {contact.email || "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <AddContactForm companyId={company.id} />
        </Card>
      </div>
    </div>
  );
}
