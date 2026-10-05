import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export * from "@/lib/action-result";

/**
 * Records an entry in the admin-visible audit trail.
 *
 * Server-only: this module imports Prisma, so client components must import
 * `ActionResult` and the formatting helpers from `@/lib/action-result`.
 */
export async function audit(params: {
  userId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        metadata: params.metadata ?? undefined,
      },
    });
  } catch (error) {
    // Auditing must never break the operation it is recording.
    console.error("Audit log write failed", error);
  }
}