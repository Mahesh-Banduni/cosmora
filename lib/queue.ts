import { prisma } from "@/lib/prisma";
import { decryptSecret } from "@/lib/crypto";
import { buildTransport, classifySendError } from "@/lib/smtp";
import {
  appendComplianceFooter,
  htmlToText,
  injectTracking,
  personalize,
} from "@/lib/email";
import type { SmtpAccount } from "@/lib/generated/prisma/client";

export type SendSummary = {
  processed: number;
  sent: number;
  failed: number;
  bounced: number;
  skipped: number;
  completed: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Sends queued emails for a campaign.
 *
 * Honours the campaign's daily limit and inter-send delay, skips suppressed
 * recipients, and retries transient failures up to `maxRetries`.
 */
export async function processCampaignQueue(
  campaignId: string,
  options: { batchSize?: number } = {}
): Promise<SendSummary> {
  const batchSize = options.batchSize ?? 50;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { smtpAccount: true },
  });

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} no longer exists.`);
  }

  if (campaign.status === "PAUSED" || campaign.status === "CANCELLED") {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      bounced: 0,
      skipped: 0,
      completed: false,
    };
  }

  const smtp = campaign.smtpAccount;
  if (!smtp) {
    throw new Error("No SMTP account is connected to this campaign.");
  }

  const since = new Date(Date.now() - DAY_MS);
  const sentRecently = await prisma.emailQueue.count({
    where: { campaignId, sentAt: { gte: since } },
  });

  const remainingToday = Math.max(0, campaign.dailyLimit - sentRecently);

  if (remainingToday === 0) {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      bounced: 0,
      skipped: 0,
      completed: false,
    };
  }

  const queued = await prisma.emailQueue.findMany({
    where: {
      campaignId,
      status: "QUEUED",
      scheduledFor: { lte: new Date() },
      attempts: { lt: campaign.maxRetries + 1 },
    },
    orderBy: { scheduledFor: "asc" },
    take: Math.min(batchSize, remainingToday),
    include: {
          contact: { include: { company: true } },
      campaign: true,
    },
  });

  const transport = buildTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    username: smtp.username,
    password: decryptSecret(smtp.encryptedPassword),
    fromName: smtp.fromName,
    fromEmail: smtp.fromEmail,
    replyTo: smtp.replyTo,
  });

  const personalization = (campaign.personalization ?? {}) as {
    meetingLink?: string;
  };

  const summary: SendSummary = {
    processed: 0,
    sent: 0,
    failed: 0,
    bounced: 0,
    skipped: 0,
    completed: false,
  };

  for (const email of queued) {
    const address = email.emailAddress.toLowerCase();

    // Re-check suppression at send time so a late opt-out is honoured.
    const suppressed = await prisma.suppression.findUnique({ where: { email: address } });

    if (suppressed) {
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: "UNSUBSCRIBED",
          unsubscribedAt: new Date(),
          lastError: `Suppressed: ${suppressed.reason}`,
        },
      });
      summary.skipped += 1;
      summary.processed += 1;
      continue;
    }

    await prisma.emailQueue.update({
      where: { id: email.id },
      data: { status: "SENDING", attempts: { increment: 1 } },
    });

    const context = {
      contact: {
        firstName: email.contact?.firstName ?? null,
        lastName: email.contact?.lastName ?? null,
        jobTitle: email.contact?.jobTitle ?? null,
      },
      company: email.contact
        ? {
            name: email.contact.company?.name ?? null,
            industry: email.contact.company?.industry ?? null,
            country: email.contact.company?.country ?? null,
            state: email.contact.company?.state ?? null,
            city: email.contact.company?.city ?? null,
            website: email.contact.company?.website ?? null,
          }
        : {
            name: null,
            industry: null,
            country: null,
            state: null,
            city: null,
            website: null,
          },
      sender: {
        name: smtp.fromName,
        email: smtp.fromEmail,
        company: null,
      },
      meetingLink: personalization.meetingLink ?? null,
    };

    const body = campaign.htmlBody ?? "";
    const personalizedHtml = personalize(body, context);
    const subject = personalize(campaign.subject ?? "", context);

    const finalHtml = injectTracking(
      appendComplianceFooter(personalizedHtml, email.trackingToken, null),
      email.trackingToken
    );

    try {
      const info = await transport.sendMail({
        from: { name: smtp.fromName, address: smtp.fromEmail },
        to: { name: email.contact ? `${email.contact.firstName} ${email.contact.lastName}` : address, address },
        replyTo: smtp.replyTo ?? smtp.fromEmail,
        subject,
        text: personalize(htmlToText(personalizedHtml), context),
        html: finalHtml,
        headers: {
          "X-Cosmora-Campaign": campaignId,
          "X-Cosmora-Token": email.trackingToken,
        },
      });

      await prisma.emailQueue.update({
        where: { id: email.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          messageId: info.messageId ?? null,
          lastError: null,
        },
      });

      await prisma.campaignLead.updateMany({
        where: { campaignId, contactId: email.contactId },
        data: { status: "SENT" },
      });

      summary.sent += 1;
    } catch (error) {
      const { outcome, message } = classifySendError(error);
      const failed = await prisma.emailQueue.findUnique({
        where: { id: email.id },
        select: { attempts: true },
      });

      const canRetry = outcome === "FAILED" && (failed?.attempts ?? 0) <= campaign.maxRetries;

      await prisma.emailQueue.update({
        where: { id: email.id },
        data: canRetry
          ? { status: "QUEUED", lastError: message, scheduledFor: new Date(Date.now() + 60_000) }
          : {
              status: outcome === "BOUNCED" ? "BOUNCED" : "FAILED",
              failedAt: new Date(),
              bouncedAt: outcome === "BOUNCED" ? new Date() : null,
              lastError: message,
            },
      });

      // A permanent bounce means this address should never be contacted again.
      if (outcome === "BOUNCED") {
        await prisma.suppression.upsert({
          where: { email: address },
          create: {
            email: address,
            reason: "BOUNCE",
            source: `campaign:${campaignId}`,
            contactId: email.contactId,
          },
          update: {},
        });
        summary.bounced += 1;
      } else if (!canRetry) {
        summary.failed += 1;
      }
    }

    summary.processed += 1;

    // Respect the configured pacing between messages.
    if (campaign.sendDelaySec > 0 && summary.processed < queued.length) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(campaign.sendDelaySec, 10) * 1000)
      );
    }
  }

  const stillQueued = await prisma.emailQueue.count({
    where: { campaignId, status: { in: ["QUEUED", "SENDING"] } },
  });

  summary.completed = stillQueued === 0;

  if (summary.completed) {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  } else {
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "SENDING", startedAt: campaign.startedAt ?? new Date() },
    });
  }

  return summary;
}

/**
 * Picks up campaigns whose scheduled time has arrived.
 * Intended to be called from a cron job or a scheduled route.
 */
export async function processDueCampaigns(): Promise<SendSummary[]> {
  const due = await prisma.campaign.findMany({
    where: {
      OR: [
        { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
        { status: "SENDING" },
      ],
    },
    select: { id: true },
  });

  const results: SendSummary[] = [];

  for (const campaign of due) {
    try {
      if (campaign.id) {
        const summary = await processCampaignQueue(campaign.id);
        if (summary.processed > 0) results.push(summary);
      }
    } catch (error) {
      console.error(`Queue processing failed for campaign ${campaign.id}`, error);
    }
  }

  return results;
}

export async function defaultSmtpFor(
  userId: string
): Promise<SmtpAccount | null> {
  const accounts = await prisma.smtpAccount.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
    take: 1,
  });

  return accounts[0] ?? null;
}