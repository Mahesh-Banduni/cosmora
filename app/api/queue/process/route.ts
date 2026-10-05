import { NextResponse } from "next/server";
import { processDueCampaigns } from "@/lib/queue";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Drains queued campaign emails.
 *
 * Intended to be called on a schedule (cron) or manually from the campaign
 * detail page. Guarded by `QUEUE_SECRET` so it cannot be triggered publicly.
 */
export async function POST(request: Request) {
  const secret = process.env.QUEUE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "QUEUE_SECRET is not configured." },
      { status: 503 }
    );
  }

  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summaries = await processDueCampaigns();

    return NextResponse.json({
      campaigns: summaries.length,
      totals: summaries.reduce(
        (acc, summary) => ({
          sent: acc.sent + summary.sent,
          failed: acc.failed + summary.failed,
          bounced: acc.bounced + summary.bounced,
          skipped: acc.skipped + summary.skipped,
        }),
        { sent: 0, failed: 0, bounced: 0, skipped: 0 }
      ),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed." },
      { status: 500 }
    );
  }
}