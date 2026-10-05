import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Records a click then forwards the recipient to the destination.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const destination = request.nextUrl.searchParams.get("url");
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  if (!token || !destination) {
    return new NextResponse("Missing parameters", { status: 400 });
  }

  // Only http(s) destinations are ever redirected to.
  let target: URL;
  try {
    target = new URL(destination);
    if (target.protocol !== "http:" && target.protocol !== "https:") {
      return new NextResponse("Unsupported protocol", { status: 400 });
    }
  } catch {
    return new NextResponse("Invalid destination", { status: 400 });
  }

  try {
    const email = await prisma.emailQueue.findUnique({
      where: { trackingToken: token },
    });

    if (email) {
      await prisma.$transaction([
        prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: "CLICKED", clickedAt: new Date() },
        }),
        prisma.emailEvent.create({
          data: {
            emailId: email.id,
            type: "CLICK",
            url: target.toString(),
            userAgent,
            ipAddress,
          },
        }),
        prisma.campaignLead.updateMany({
          where: { campaignId: email.campaignId, contactId: email.contactId },
          data: { status: "CLICKED" },
        }),
      ]);
    }
  } catch (error) {
    console.error("Click tracking failed", error);
  }

  return NextResponse.redirect(target.toString());
}