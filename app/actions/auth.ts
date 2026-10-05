"use server";

import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  getCurrentUser,
  hashPassword,
  requireAdmin,
  verifyPassword,
} from "@/lib/auth";
import { audit, messageOf, slugify, type ActionResult } from "@/lib/utils";

export type AuthState = {
  error?: string;
  success?: string;
  destination?: string;
} | null;

/**
 * Validates credentials and returns the landing route for the account.
 *
 * The NextAuth session cookie is issued client-side via `signIn()` from
 * `next-auth/react`, because v4 exposes no server-side `signIn`. This
 * action is the authoritative credential check that runs first.
 */
export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  if (user.status !== "ACTIVE") {
    return { error: "This account is not active. Contact your administrator." };
  }

  await audit({
    userId: user.id,
    action: "auth.login",
    entityType: "User",
    entityId: user.id,
  });

  return { destination: user.role === "ADMIN" ? "/admin" : "/dashboard" };
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const organizationName = String(formData.get("organizationName") ?? "").trim();

  if (!name || !email || !password) {
    return { error: "Name, email and password are required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const organization = organizationName
    ? await prisma.organization.upsert({
        where: { slug: slugify(organizationName) },
        create: { name: organizationName, slug: slugify(organizationName) },
        update: {},
      })
    : null;

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: "USER",
      status: "ACTIVE",
      organizationId: organization?.id ?? null,
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      amount: 100,
      balanceAfter: 100,
      reason: "Welcome credits",
    },
  });

  await audit({
    userId: user.id,
    action: "auth.register",
    entityType: "User",
    entityId: user.id,
  });

  return { destination: "/dashboard" };
}

export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { error: "Enter your email address." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always report success so this form cannot be used to enumerate accounts.
  if (user) {
    await prisma.passwordResetToken.create({
      data: {
        token: randomBytes(32).toString("hex"),
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
  }

  return { success: "If that email is registered, a reset link has been sent." };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!token || password.length < 8) {
    return {
      error: "Provide a valid token and a password of at least 8 characters.",
    };
  }

  const reset = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!reset || reset.usedAt || reset.expiresAt.getTime() < Date.now()) {
    return { error: "This reset link is invalid or has expired." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: "Your password has been reset. You can now sign in." };
}

export async function updateProfileAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Please sign in again." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  try {
    if (newPassword) {
      if (newPassword.length < 8) {
        return { error: "New password must be at least 8 characters." };
      }

      const fresh = await prisma.user.findUnique({ where: { id: user.id } });
      if (!fresh) return { error: "Account not found." };

      if (!(await verifyPassword(currentPassword, fresh.passwordHash))) {
        return { error: "Current password is incorrect." };
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        email,
        ...(newPassword ? { passwordHash: await hashPassword(newPassword) } : {}),
      },
    });

    return { success: "Profile updated." };
  } catch (error) {
    return { error: messageOf(error) };
  }
}

export async function createOrganizationAction(
  _prev: AuthState,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return { ok: false, error: "Organization name is required." };
  }

  try {
    const organization = await prisma.organization.create({
      data: { name, slug: `${slugify(name)}-${Date.now().toString(36)}` },
    });

    await audit({
      userId: admin.id,
      action: "organization.create",
      entityType: "Organization",
      entityId: organization.id,
    });

    return {
      ok: true,
      data: { id: organization.id },
      message: "Organization created.",
    };
  } catch (error) {
    return { ok: false, error: messageOf(error) };
  }
}