import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserShell } from "@/app/components/dashboard/UserShell";

export const dynamic = "force-dynamic";

export default async function UserLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();

  const latest = await prisma.creditTransaction.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { balanceAfter: true },
  });

  return (
    <UserShell user={user} credits={latest?.balanceAfter ?? 0}>
      {children}
    </UserShell>
  );
}