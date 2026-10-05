"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";
import {
  audit,
  fail,
  messageOf,
  ok,
  parseNumber,
  parseString,
  type ActionResult,
} from "@/lib/utils";

export async function createUserAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();

  const name = parseString(formData.get("name"));
  const email = parseString(formData.get("email"))?.toLowerCase();
  const password = parseString(formData.get("password"));
  const role = parseString(formData.get("role")) === "ADMIN" ? "ADMIN" : "USER";
  const organizationId = parseString(formData.get("organizationId"));
  const credits = parseNumber(formData.get("credits")) ?? 0;

  if (!name || !email) return fail("Name and email are required.");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return fail("Enter a valid email address.");
  }

  if (!password || password.length < 8) {
    return fail("Password must be at least 8 characters.");
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail("A user with this email already exists.");

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role,
        status: "ACTIVE",
        organizationId,
      },
    });

    if (credits > 0) {
      await prisma.creditTransaction.create({
        data: {
          userId: user.id,
          amount: credits,
          balanceAfter: credits,
          reason: "Admin allocation",
        },
      });
    }

    await audit({
      userId: admin.id,
      action: "user.create",
      entityType: "User",
      entityId: user.id,
    });

    revalidatePath("/admin/users");
    return ok({ id: user.id }, "User created.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function updateUserStatusAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = parseString(formData.get("id"));
  const status = parseString(formData.get("status"));

  if (!id) return fail("User id is required.");

  const allowed = ["ACTIVE", "INVITED", "SUSPENDED"] as const;

  if (!status || !allowed.includes(status as (typeof allowed)[number])) {
    return fail("Unsupported status.");
  }

  if (id === admin.id) {
    return fail("You cannot change your own account status.");
  }

  try {
      // JWT sessions are checked against `status` on every request, so a
      // suspended user is rejected as soon as the record flips.
      await prisma.user.update({
      where: { id },
      data: { status: status as (typeof allowed)[number] },
    });

    await audit({
      userId: admin.id,
      action: "user.status",
      entityType: "User",
      entityId: id,
      metadata: { status },
    });

    revalidatePath("/admin/users");
    return ok(undefined, "User status updated.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function updateUserRoleAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = parseString(formData.get("id"));
  const role = parseString(formData.get("role"));

  if (!id || !role) return fail("User id and role are required.");

  if (id === admin.id) {
    return fail("You cannot change your own role.");
  }

  if (role !== "ADMIN" && role !== "USER") {
    return fail("Unsupported role.");
  }

  try {
    await prisma.user.update({ where: { id }, data: { role } });

    await audit({
      userId: admin.id,
      action: "user.role",
      entityType: "User",
      entityId: id,
      metadata: { role },
    });

    revalidatePath("/admin/users");
    return ok(undefined, "Role updated.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function assignOrganizationAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = parseString(formData.get("id"));
  const organizationId = parseString(formData.get("organizationId"));

  if (!id) return fail("User id is required.");

  try {
    await prisma.user.update({ where: { id }, data: { organizationId } });

    await audit({
      userId: admin.id,
      action: "user.organization",
      entityType: "User",
      entityId: id,
    });

    revalidatePath("/admin/users");
    return ok(undefined, "Organization assigned.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function adjustCreditsAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = parseString(formData.get("id"));
  const amount = parseNumber(formData.get("amount"));
  const reason = parseString(formData.get("reason")) ?? "Admin adjustment";

  if (!id) return fail("User id is required.");
  if (amount === null || amount === 0) {
    return fail("Enter a non-zero credit amount.");
  }

  try {
    const ledger = await prisma.creditTransaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    const balanceAfter = Math.max(0, (ledger[0]?.balanceAfter ?? 0) + amount);

    await prisma.creditTransaction.create({
      data: { userId: id, amount, balanceAfter, reason },
    });

    await audit({
      userId: admin.id,
      action: "credits.adjust",
      entityType: "User",
      entityId: id,
      metadata: { amount, balanceAfter },
    });

    revalidatePath("/admin/users");
    return ok(undefined, `Balance updated to ${balanceAfter} credits.`);
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function createCategoryAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const name = parseString(formData.get("name"));

  if (!name) return fail("Category name is required.");

  try {
    const category = await prisma.category.create({
      data: {
        name,
        description: parseString(formData.get("description")),
        color: parseString(formData.get("color")),
      },
    });

    await audit({
      userId: admin.id,
      action: "category.create",
      entityType: "Category",
      entityId: category.id,
    });

    revalidatePath("/admin/categories");
    return ok({ id: category.id }, "Category created.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function updateCategoryAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const id = parseString(formData.get("id"));
  const name = parseString(formData.get("name"));

  if (!id) return fail("Category id is required.");
  if (!name) return fail("Category name is required.");

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        description: parseString(formData.get("description")),
        color: parseString(formData.get("color")),
      },
    });

    await audit({
      userId: admin.id,
      action: "category.update",
      entityType: "Category",
      entityId: category.id,
    });

    revalidatePath("/admin/categories");
    return ok({ id: category.id }, "Category updated.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function deleteCategoryAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const id = parseString(formData.get("id"));

  if (!id) return fail("Category id is required.");

  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return ok(undefined, "Category deleted.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function setCompanyCategoriesAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const companyId = parseString(formData.get("companyId"));
  const categoryIds = formData.getAll("categoryIds").map(String);

  if (!companyId) return fail("Company id is required.");

  try {
    await prisma.companyCategory.deleteMany({ where: { companyId } });

    if (categoryIds.length > 0) {
      await prisma.companyCategory.createMany({
        data: categoryIds.map((categoryId) => ({ companyId, categoryId })),
      });
    }

    revalidatePath(`/admin/leads/${companyId}`);
    return ok(undefined, "Categories updated.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function suppressEmailAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const email = parseString(formData.get("email"))?.toLowerCase();
  const reason = parseString(formData.get("reason")) ?? "DO_NOT_CONTACT";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return fail("Enter a valid email address.");
  }

  const allowed = [
    "UNSUBSCRIBE",
    "BOUNCE",
    "DO_NOT_CONTACT",
    "MANUAL",
    "INVALID_EMAIL",
  ] as const;

  if (!allowed.includes(reason as (typeof allowed)[number])) {
    return fail("Unsupported suppression reason.");
  }

  try {
    await prisma.suppression.upsert({
      where: { email },
      create: {
        email,
        reason: reason as (typeof allowed)[number],
        source: `admin:${admin.id}`,
      },
      update: { reason: reason as (typeof allowed)[number] },
    });

    await audit({
      userId: admin.id,
      action: "suppression.create",
      entityType: "Suppression",
      metadata: { email, reason },
    });

    revalidatePath("/admin/compliance");
    return ok(undefined, "Address added to the suppression list.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function removeSuppressionAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const email = parseString(formData.get("email"))?.toLowerCase();

  if (!email) return fail("Email is required.");

  await prisma.suppression.deleteMany({ where: { email } });
  revalidatePath("/admin/compliance");
  return ok(undefined, "Address removed from the suppression list.");
}