import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/generated/prisma/enums";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Resolves the signed-in user.
 *
 * NextAuth owns the session; the database is only consulted so that an
 * account suspended or deleted after the token was issued is rejected.
 */
export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      organizationId: true,
    },
  });

  if (!user || user.status !== "ACTIVE") return null;

  return user;
});

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof getCurrentUser>>
>;

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireUser();

  if (user.role !== role) {
    redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  }

  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole("ADMIN");
}

/**
 * Auth check for route handlers, which cannot use `redirect()`.
 */
export async function getSessionUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}