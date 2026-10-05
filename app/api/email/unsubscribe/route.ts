import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const page = (heading: string, message: string, status = 200) =>
  new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${heading}</title>
<style>
  body{margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;
    font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#fafafa;color:#191500}
  .card{max-width:480px;margin:24px;padding:32px;border:1px solid #e5e5e5;border-radius:16px;background:#fff}
  h1{margin:0 0 12px;font-size:22px;line-height:1.3}
  p{margin:0;color:#5d5d55;font-size:15px;line-height:1.6}
</style></head>
<body><div class="card"><h1>${heading}</h1><p>${message}</p></div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

/**
 * One-click unsubscribe. Adds the address to the global suppression list so
 * no future campaign can contact it.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return page("Link not valid", "This unsubscribe link is missing its token.", 400);
  }

  try {
    const email = await prisma.emailQueue.findUnique({
      where: { trackingToken: token },
    });

    if (!email) {
      return page(
        "Link not valid",
        "This unsubscribe link is no longer valid.",
        404
      );
    }

    await prisma.$transaction([
      prisma.suppression.upsert({
        where: { email: email.emailAddress.toLowerCase() },
        create: {
          email: email.emailAddress.toLowerCase(),
          reason: "UNSUBSCRIBE",
          source: `email:${email.id}`,
          contactId: email.contactId,
        },
        update: { reason: "UNSUBSCRIBE" },
      }),
      prisma.emailQueue.update({
        where: { id: email.id },
        data: { status: "UNSUBSCRIBED", unsubscribedAt: new Date() },
      }),
      prisma.emailEvent.create({
        data: { emailId: email.id, type: "UNSUBSCRIBE" },
      }),
      prisma.campaignLead.updateMany({
        where: { campaignId: email.campaignId, contactId: email.contactId },
        data: { status: "UNSUBSCRIBED" },
      }),
    ]);

    return page(
      "You have been unsubscribed",
      "We will not email this address again. Sorry to see you go."
    );
  } catch (error) {
    console.error("Unsubscribe failed", error);
    return page(
      "Something went wrong",
      "We could not record your unsubscribe. Please try again later.",
      500
    );
  }
}