"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { parseLeadFile } from "@/lib/lead-import";
import {
  audit,
  fail,
  messageOf,
  ok,
  parseList,
  parseNumber,
  parseString,
  type ActionResult,
} from "@/lib/utils";

async function admin() {
  return requireAdmin();
}

export async function createCompanyAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  await admin();

  const name = parseString(formData.get("name"));

  if (!name) return fail("Company name is required.");

  try {
    const company = await prisma.company.create({
      data: {
        name,
        domain: parseString(formData.get("domain")),
        website: parseString(formData.get("website")),
        industry: parseString(formData.get("industry")),
        description: parseString(formData.get("description")),
        employeeCount: parseNumber(formData.get("employeeCount")),
        revenueMin: parseNumber(formData.get("revenueMin")),
        revenueMax: parseNumber(formData.get("revenueMax")),
        country: parseString(formData.get("country")),
        state: parseString(formData.get("state")),
        city: parseString(formData.get("city")),
        technologies: parseList(formData.get("technologies")),
        keywords: parseList(formData.get("keywords")),
        isVerified: formData.get("isVerified") === "on",
      },
    });

    await prisma.lead.create({ data: { companyId: company.id } });

    await audit({
      userId: (await admin()).id,
      action: "company.create",
      entityType: "Company",
      entityId: company.id,
    });

    revalidatePath("/admin/leads");
    return ok({ id: company.id }, "Company created.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function updateCompanyAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await admin();
  const id = parseString(formData.get("id"));

  if (!id) return fail("Company id is required.");

  try {
    await prisma.company.update({
      where: { id },
      data: {
        name: parseString(formData.get("name")) ?? "",
        domain: parseString(formData.get("domain")),
        website: parseString(formData.get("website")),
        industry: parseString(formData.get("industry")),
        description: parseString(formData.get("description")),
        employeeCount: parseNumber(formData.get("employeeCount")),
        revenueMin: parseNumber(formData.get("revenueMin")),
        revenueMax: parseNumber(formData.get("revenueMax")),
        country: parseString(formData.get("country")),
        state: parseString(formData.get("state")),
        city: parseString(formData.get("city")),
        technologies: parseList(formData.get("technologies")),
        keywords: parseList(formData.get("keywords")),
        isVerified: formData.get("isVerified") === "on",
      },
    });

    await audit({
      userId: user.id,
      action: "company.update",
      entityType: "Company",
      entityId: id,
    });

    revalidatePath("/admin/leads");
    revalidatePath(`/admin/leads/${id}`);
    return ok({ id }, "Company updated.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function deleteCompanyAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await admin();
  const id = parseString(formData.get("id"));

  if (!id) return fail("Company id is required.");

  try {
    await prisma.company.delete({ where: { id } });
    await audit({
      userId: user.id,
      action: "company.delete",
      entityType: "Company",
      entityId: id,
    });

    revalidatePath("/admin/leads");
    return ok(undefined, "Company deleted.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

/**
 * Sets whether a company's leads may be shown to users, which is the
 * admin-controlled availability switch for the whole lead pool.
 */
export async function setCompanyAvailabilityAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await admin();
  const id = parseString(formData.get("id"));
  const status = parseString(formData.get("status"));

  if (!id || !status) return fail("Company id and status are required.");

  const allowed = ["AVAILABLE", "RESERVED", "LOCKED", "ARCHIVED"] as const;

  if (!allowed.includes(status as (typeof allowed)[number])) {
    return fail("Unsupported availability status.");
  }

  try {
    await prisma.company.update({
      where: { id },
      data: { status: status as (typeof allowed)[number] },
    });

    if (status === "LOCKED" || status === "ARCHIVED") {
      await prisma.lead.updateMany({
        where: { companyId: id },
        data: { availability: "HIDDEN" },
      });
    } else {
      await prisma.lead.updateMany({
        where: { companyId: id },
        data: { availability: "PREVIEW" },
      });
    }

    await audit({
      userId: user.id,
      action: "company.availability",
      entityType: "Company",
      entityId: id,
      metadata: { status },
    });

    revalidatePath("/admin/leads");
    return ok(undefined, "Availability updated.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function verifyCompanyAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await admin();
  const id = parseString(formData.get("id"));
  const verified = formData.get("verified") === "true";

  if (!id) return fail("Company id is required.");

  try {
    await prisma.company.update({
      where: { id },
      data: {
        isVerified: verified,
        lastVerifiedAt: verified ? new Date() : null,
        qualityScore: verified ? Math.max(50, 100 - 0) : 0,
      },
    });

    await audit({
      userId: user.id,
      action: verified ? "company.verify" : "company.unverify",
      entityType: "Company",
      entityId: id,
    });

    revalidatePath("/admin/leads");
    return ok(undefined, verified ? "Company verified." : "Verification removed.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function createContactAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  await admin();

  const companyId = parseString(formData.get("companyId"));
  const firstName = parseString(formData.get("firstName"));
  const lastName = parseString(formData.get("lastName"));
  const email = parseString(formData.get("email"))?.toLowerCase();

  if (!companyId) return fail("Company is required.");
  if (!firstName || !lastName) return fail("First and last name are required.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return fail("A valid email address is required.");
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        companyId,
        firstName,
        lastName,
        email,
        jobTitle: parseString(formData.get("jobTitle")),
        department: parseString(formData.get("department")),
        phone: parseString(formData.get("phone")),
        linkedinUrl: parseString(formData.get("linkedinUrl")),
      },
    });

    revalidatePath("/admin/contacts");
    revalidatePath(`/admin/leads/${companyId}`);
    return ok({ id: contact.id }, "Contact created.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function deleteContactAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await admin();
  const id = parseString(formData.get("id"));

  if (!id) return fail("Contact id is required.");

  try {
    await prisma.contact.delete({ where: { id } });
    revalidatePath("/admin/contacts");
    return ok(undefined, "Contact deleted.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function importLeadsAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<
  ActionResult<{
    jobId: string;
    imported: number;
    duplicates: number;
    invalid: number;
    total: number;
  }>
> {
  const user = await admin();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return fail("Choose a CSV or Excel file to import.");
  }

  const text = await file.text();
  const parsed = parseLeadFile(text);

  if (parsed.rows.length === 0) {
    return fail("No usable rows were found in that file.");
  }

  const invalidRows = new Set(
    parsed.issues
      .filter((issue) => issue.field === "companyName" || issue.field === "email")
      .map((issue) => issue.row)
  );

  const job = await prisma.importJob.create({
    data: {
      fileName: file.name,
      status: "PROCESSING",
      totalRows: parsed.rows.length,
      invalidRows: invalidRows.size,
      errors: parsed.issues.slice(0, 100),
    },
  });

  let imported = 0;
  let duplicates = 0;

  for (const [index, row] of parsed.rows.entries()) {
    if (invalidRows.has(index + 1)) continue;

    const name = row.companyName.trim();

    try {
      const existing = await prisma.company.findFirst({
        where: { name, domain: row.domain ?? null },
      });

      if (existing) {
        duplicates += 1;
        continue;
      }

      const company = await prisma.company.create({
        data: {
          name,
          domain: row.domain,
          website: row.website,
          industry: row.industry,
          description: row.description,
          employeeCount: row.employeeCount,
          revenueMin: row.revenueMin,
          revenueMax: row.revenueMax,
          revenueCurrency: row.revenueCurrency ?? "USD",
          country: row.country,
          state: row.state,
          city: row.city,
          technologies: row.technologies,
          keywords: row.keywords,
          isVerified: false,
        },
        select: { id: true },
      });

      if (row.email && row.firstName && row.lastName) {
        await prisma.contact.upsert({
          where: { email: row.email.toLowerCase() },
          create: {
            companyId: company.id,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email.toLowerCase(),
            jobTitle: row.jobTitle,
            department: row.department,
            phone: row.phone,
            linkedinUrl: row.linkedinUrl,
          },
          update: {},
        });
      }

      await prisma.lead.create({ data: { companyId: company.id } });
      await prisma.importJob.update({
        where: { id: job.id },
        data: { companies: { connect: { id: company.id } } },
      });

      imported += 1;
    } catch (error) {
      console.error(`Import row ${index + 2} failed`, error);
      duplicates += 1;
    }
  }

  await prisma.importJob.update({
    where: { id: job.id },
    data: {
      status: "COMPLETED",
      importedRows: imported,
      duplicateRows: duplicates,
      completedAt: new Date(),
    },
  });

  await audit({
    userId: user.id,
    action: "lead.import",
    entityType: "ImportJob",
    entityId: job.id,
    metadata: { imported, duplicates, fileName: file.name },
  });

  revalidatePath("/admin/leads");
  revalidatePath("/admin/imports");

  return ok(
    {
      jobId: job.id,
      imported,
      duplicates,
      invalid: invalidRows.size,
      total: parsed.rows.length,
    },
    `Imported ${imported} of ${parsed.rows.length} rows.`
  );
}