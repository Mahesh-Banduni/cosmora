"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { runIcpMatch } from "@/lib/lead-matching";
import {
  parseNaturalLanguageRequirements,
  explainLeadScore,
  type ParsedRequirements,
} from "@/lib/lead-intelligence";
import {
  fail,
  messageOf,
  ok,
  parseList,
  parseNumber,
  parseString,
  type ActionResult,
} from "@/lib/utils";

/* ==========================================================================
   ICPs
   ========================================================================== */

export async function parseRequirementsAction(
  _prev: ActionResult<ParsedRequirements> | null,
  formData: FormData
): Promise<ActionResult<ParsedRequirements>> {
  await requireUser();
  const text = parseString(formData.get("requirements")) ?? "";

  if (!text.trim()) return fail("Describe the customers you want to find.");

  return ok(await parseNaturalLanguageRequirements(text));
}

export async function createIcpAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const name = parseString(formData.get("name"));
  if (!name) return fail("Give your ICP a name.");

  try {
    const icp = await prisma.icp.create({
      data: {
        name,
        description: parseString(formData.get("description")),
        userId: user.id,
        organizationId: user.organizationId,
        naturalLanguageRequirements: parseString(
          formData.get("naturalLanguageRequirements")
        ),
        industries: parseList(formData.get("industries")),
        countries: parseList(formData.get("countries")),
        states: parseList(formData.get("states")),
        cities: parseList(formData.get("cities")),
        jobTitles: parseList(formData.get("jobTitles")),
        technologies: parseList(formData.get("technologies")),
        keywords: parseList(formData.get("keywords")),
        exclusions: parseList(formData.get("exclusions")),
        sizeMin: parseNumber(formData.get("sizeMin")),
        sizeMax: parseNumber(formData.get("sizeMax")),
        revenueMin: parseNumber(formData.get("revenueMin")),
        revenueMax: parseNumber(formData.get("revenueMax")),
      },
    });

    revalidatePath("/dashboard/icps");
    return ok({ id: icp.id }, "ICP saved.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function updateIcpAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const id = parseString(formData.get("id"));
  if (!id) return fail("ICP id is required.");

  const existing = await prisma.icp.findFirst({ where: { id, userId: user.id } });
  if (!existing) return fail("You do not have access to that ICP.");

  try {
    await prisma.icp.update({
      where: { id },
      data: {
        name: parseString(formData.get("name")) ?? existing.name,
        description: parseString(formData.get("description")),
        naturalLanguageRequirements: parseString(
          formData.get("naturalLanguageRequirements")
        ),
        industries: parseList(formData.get("industries")),
        countries: parseList(formData.get("countries")),
        states: parseList(formData.get("states")),
        cities: parseList(formData.get("cities")),
        jobTitles: parseList(formData.get("jobTitles")),
        technologies: parseList(formData.get("technologies")),
        keywords: parseList(formData.get("keywords")),
        exclusions: parseList(formData.get("exclusions")),
        sizeMin: parseNumber(formData.get("sizeMin")),
        sizeMax: parseNumber(formData.get("sizeMax")),
        revenueMin: parseNumber(formData.get("revenueMin")),
        revenueMax: parseNumber(formData.get("revenueMax")),
      },
    });

    revalidatePath("/dashboard/icps");
    revalidatePath(`/dashboard/icps/${id}`);
    return ok(undefined, "ICP updated.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function deleteIcpAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const id = parseString(formData.get("id"));
  if (!id) return fail("ICP id is required.");

  const existing = await prisma.icp.findFirst({ where: { id, userId: user.id } });
  if (!existing) return fail("You do not have access to that ICP.");

  await prisma.icp.delete({ where: { id } });
  revalidatePath("/dashboard/icps");
  return ok(undefined, "ICP deleted.");
}

export async function runMatchAction(
  _prev: ActionResult<{ matched: number; total: number }> | null,
  formData: FormData
): Promise<ActionResult<{ matched: number; total: number }>> {
  const user = await requireUser();
  const icpId = parseString(formData.get("icpId"));
  if (!icpId) return fail("ICP id is required.");

  const icp = await prisma.icp.findFirst({ where: { id: icpId, userId: user.id } });
  if (!icp) return fail("You do not have access to that ICP.");

  try {
    const result = await runIcpMatch(icp);

    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/icps/${icpId}`);

    return ok(
      result,
      `Matched ${result.matched} of ${result.total} companies evaluated.`
    );
  } catch (error) {
    return fail(messageOf(error));
  }
}

/* ==========================================================================
   Leads
   ========================================================================== */

/** Current credit balance, derived from the ledger. */
export async function getCreditBalance(userId: string): Promise<number> {
  const latest = await prisma.creditTransaction.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { balanceAfter: true },
  });

  return latest?.balanceAfter ?? 0;
}

export async function unlockLeadAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const leadId = parseString(formData.get("leadId"));
  if (!leadId) return fail("Lead id is required.");

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { company: true },
  });

  if (!lead) return fail("That lead no longer exists.");
    if (!lead.company) return fail("This lead has no company record.");

    // Backend permission check: locked/archived companies are never unlockable.
    if (lead.company.status === "LOCKED" || lead.company.status === "ARCHIVED") {
      return fail("This company is not currently available.");
    }

  const alreadyUnlocked = await prisma.leadUnlock.findUnique({
    where: { leadId_userId: { leadId, userId: user.id } },
  });

  if (alreadyUnlocked) {
    await prisma.lead.update({
      where: { id: leadId },
      data: { availability: "UNLOCKED" },
    });
    revalidatePath("/dashboard/leads");
    return ok(undefined, "You already have access to this lead.");
  }

  const balance = await getCreditBalance(user.id);

  if (balance < 1) {
    return fail("You are out of credits. Ask an administrator for more.");
  }

  try {
    await prisma.$transaction([
      prisma.leadUnlock.create({
        data: { leadId, userId: user.id, creditsUsed: 1 },
      }),
      prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -1,
          balanceAfter: balance - 1,
          reason: `Unlocked ${lead.company.name}`,
        },
      }),
      prisma.lead.update({
        where: { id: leadId },
        data: { availability: "UNLOCKED" },
      }),
    ]);

    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard");
    return ok(undefined, "Lead unlocked.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function toggleSavedLeadAction(
  _prev: ActionResult<{ saved: boolean }> | null,
  formData: FormData
): Promise<ActionResult<{ saved: boolean }>> {
  const user = await requireUser();
  const leadId = parseString(formData.get("leadId"));
  if (!leadId) return fail("Lead id is required.");

  const existing = await prisma.savedLead.findUnique({
    where: { leadId_userId: { leadId, userId: user.id } },
  });

  if (existing) {
    await prisma.savedLead.delete({
      where: { id: existing.id },
    });
    revalidatePath("/dashboard/leads");
    revalidatePath("/dashboard/saved");
    return ok({ saved: false }, "Removed from saved leads.");
  }

  await prisma.savedLead.create({ data: { leadId, userId: user.id } });
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard/saved");
  return ok({ saved: true }, "Saved.");
}

export async function addTagAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const leadId = parseString(formData.get("leadId"));
  const name = parseString(formData.get("name"));
  const color = parseString(formData.get("color"));

  if (!leadId || !name) return fail("Lead and tag name are required.");

  try {
    await prisma.leadTag.upsert({
      where: { leadId_userId_name: { leadId, userId: user.id, name } },
      create: { leadId, userId: user.id, name, color },
      update: { color },
    });

    revalidatePath("/dashboard/leads");
    return ok(undefined, "Tag added.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function removeTagAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const leadId = parseString(formData.get("leadId"));
  const name = parseString(formData.get("name"));

  if (!leadId || !name) return fail("Lead and tag name are required.");

  await prisma.leadTag.deleteMany({ where: { leadId, userId: user.id, name } });
  revalidatePath("/dashboard/leads");
  return ok(undefined, "Tag removed.");
}

export async function addNoteAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const leadId = parseString(formData.get("leadId"));
  const body = parseString(formData.get("body"));

  if (!leadId || !body) return fail("Lead and note text are required.");

  await prisma.leadNote.create({ data: { leadId, userId: user.id, body } });
  revalidatePath("/dashboard/leads");
  return ok(undefined, "Note added.");
}

export async function deleteNoteAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const id = parseString(formData.get("id"));
  if (!id) return fail("Note id is required.");

  await prisma.leadNote.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/dashboard/leads");
  return ok(undefined, "Note deleted.");
}

export async function updateLeadStatusAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const leadId = parseString(formData.get("leadId"));
  const status = parseString(formData.get("status"));

  if (!leadId || !status) return fail("Lead and status are required.");

  const allowed = [
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "UNQUALIFIED",
    "CONVERTED",
    "DO_NOT_CONTACT",
  ] as const;

  if (!allowed.includes(status as (typeof allowed)[number])) {
    return fail("Unsupported lead status.");
  }

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, unlocks: { some: { userId: user.id } } },
  });

  if (!lead) return fail("Unlock this lead before changing its status.");

  await prisma.lead.update({
    where: { id: leadId },
    data: { status: status as (typeof allowed)[number] },
  });

  revalidatePath("/dashboard/leads");
  return ok(undefined, "Lead status updated.");
}

/**
 * Generates the AI explanation for an existing lead score.
 */
export async function explainScoreAction(
  _prev: ActionResult<{ explanation: string }> | null,
  formData: FormData
): Promise<ActionResult<{ explanation: string }>> {
  const user = await requireUser();
  const leadId = parseString(formData.get("leadId"));
  const icpId = parseString(formData.get("icpId"));

  if (!leadId || !icpId) return fail("Lead and ICP are required.");

  const score = await prisma.leadScore.findUnique({
    where: { leadId_icpId: { leadId, icpId } },
    include: {
      lead: { include: { company: true, contact: true } },
      icp: true,
    },
  });

  if (!score) return fail("This lead has not been scored against that ICP yet.");

  const criteria = Array.isArray(score.breakdown)
    ? []
    : ((score.breakdown as { matchedCriteria?: string[] } | null)?.matchedCriteria ?? []);

  const company = score.lead.company;

  if (!company) return fail("Company record is missing.");

  const explanation = await explainLeadScore(
    {
      name: score.icp.name,
      industries: score.icp.industries,
      jobTitles: score.icp.jobTitles,
      technologies: score.icp.technologies,
    },
    {
      name: company.name,
      industry: company.industry,
      employeeCount: company.employeeCount,
      country: company.country,
      technologies: company.technologies,
    },
    score.lead.contact
      ? { jobTitle: score.lead.contact.jobTitle }
      : null,
    score.score,
    criteria
  );

  await prisma.leadScore.update({
    where: { id: score.id },
    data: { explanation },
  });

  revalidatePath("/dashboard/leads");
  return ok({ explanation });
}