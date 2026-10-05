import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 1x1 tracking pixel. Records the open once per message.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  if (!token) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const email = await prisma.emailQueue.findUnique({ where: { trackingToken: token } });

    if (email && !email.openedAt) {
      await prisma.$transaction([
        prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: "OPENED", openedAt: new Date() },
        }),
        prisma.emailEvent.create({
          data: { emailId: email.id, type: "OPEN", userAgent, ipAddress },
        }),
        prisma.campaignLead.updateMany({
          where: { campaignId: email.campaignId, contactId: email.contactId },
          data: { status: "OPENED" },
        }),
      ]);
    }
  } catch (error) {
    // A tracking failure must never break the email render.
    console.error("Open tracking failed", error);
  }

  // 1x1 transparent GIF.
  const gif = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );

  return new NextResponse(gif, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}