"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";
import { testSmtpConnection, buildTransport } from "@/lib/smtp";
import { generateEmail, type GeneratedEmail } from "@/lib/lead-intelligence";
import {
  fail,
  messageOf,
  ok,
  parseList,
  parseNumber,
  parseString,
  type ActionResult,
} from "@/lib/utils";
import { htmlToText } from "@/lib/email";

/* ==========================================================================
   SMTP accounts
   ========================================================================== */

export async function createSmtpAccountAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const name = parseString(formData.get("name"));
  const host = parseString(formData.get("host"));
  const port = parseNumber(formData.get("port"));
  const username = parseString(formData.get("username"));
  const password = parseString(formData.get("password"));
  const fromName = parseString(formData.get("fromName"));
  const fromEmail = parseString(formData.get("fromEmail"))?.toLowerCase();
  const replyTo = parseString(formData.get("replyTo"))?.toLowerCase() ?? null;
  const secure = formData.get("secure") !== "off";

  if (!name) return fail("Give this account a label.");
  if (!host) return fail("SMTP host is required.");
  if (port === null) return fail("SMTP port is required.");
  if (!username) return fail("SMTP username is required.");
  if (!password) return fail("SMTP password is required.");
  if (!fromName) return fail("From name is required.");
  if (!fromEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fromEmail)) {
    return fail("Enter a valid from email address.");
  }

  try {
    const makeDefault = formData.get("isDefault") === "on";

    if (makeDefault) {
      await prisma.smtpAccount.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const account = await prisma.smtpAccount.create({
      data: {
        userId: user.id,
        name,
        host,
        port,
        secure,
        username,
        // Credentials are encrypted at rest and never returned to the client.
        encryptedPassword: encryptSecret(password),
        fromName,
        fromEmail,
        replyTo,
        isDefault: makeDefault,
      },
    });

    revalidatePath("/dashboard/smtp");
    return ok({ id: account.id }, "SMTP account saved.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function testSmtpAccountAction(
  _prev: ActionResult<{ result: string }> | null,
  formData: FormData
): Promise<ActionResult<{ result: string }>> {
  const user = await requireUser();

  const accountId = parseString(formData.get("accountId"));
  const liveHost = parseString(formData.get("host"));
  const livePort = parseNumber(formData.get("port"));
  const liveUsername = parseString(formData.get("username"));
  const livePassword = parseString(formData.get("password"));
  const secure = formData.get("secure") !== "off";

  // An unsaved form is tested with the values currently on screen; a saved
  // account is tested with its decrypted credentials.
  let config: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    fromName: string;
    fromEmail: string;
    replyTo?: string | null;
  } | null = null;

  if (liveHost && livePort !== null && liveUsername && livePassword) {
    config = {
      host: liveHost,
      port: livePort,
      secure,
      username: liveUsername,
      password: livePassword,
      fromName: parseString(formData.get("fromName")) ?? "",
      fromEmail: parseString(formData.get("fromEmail")) ?? "",
            replyTo: parseString(formData.get("replyTo")) ?? null,
    };
  } else if (accountId) {
    const account = await prisma.smtpAccount.findFirst({
      where: { id: accountId, userId: user.id },
    });

    if (!account) return fail("That SMTP account no longer exists.");

    const { decryptSecret } = await import("@/lib/crypto");
    config = {
      host: account.host,
      port: account.port,
      secure: account.secure,
      username: account.username,
      password: decryptSecret(account.encryptedPassword),
      fromName: account.fromName,
      fromEmail: account.fromEmail,
      replyTo: account.replyTo,
    };
  }

  if (!config) return fail("Enter the SMTP details before testing.");

  const outcome = await testSmtpConnection(config);

  if (accountId) {
    await prisma.smtpAccount.update({
      where: { id: accountId },
      data: {
        isVerified: outcome.ok,
        lastTestedAt: new Date(),
        lastTestResult: outcome.message,
      },
    });
  }

  revalidatePath("/dashboard/smtp");

  return outcome.ok
    ? ok({ result: outcome.message }, "Connection succeeded.")
    : fail(outcome.message);
}

export async function sendTestEmailAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  const accountId = parseString(formData.get("accountId"));
  const recipient = parseString(formData.get("recipient"))?.toLowerCase();

  if (!accountId) return fail("Choose an SMTP account.");
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(recipient)) {
    return fail("Enter a valid recipient email address.");
  }

  const account = await prisma.smtpAccount.findFirst({
    where: { id: accountId, userId: user.id },
  });

  if (!account) return fail("That SMTP account no longer exists.");

  const { decryptSecret } = await import("@/lib/crypto");

  try {
    const transport = buildTransport({
      host: account.host,
      port: account.port,
      secure: account.secure,
      username: account.username,
      password: decryptSecret(account.encryptedPassword),
      fromName: account.fromName,
      fromEmail: account.fromEmail,
      replyTo: account.replyTo,
    });

    await transport.sendMail({
      from: { name: account.fromName, address: account.fromEmail },
      to: recipient,
      replyTo: account.replyTo ?? account.fromEmail,
      subject: "Cosmora SMTP test",
      text: "Your SMTP connection works. This message was sent from Cosmora.",
      html: "<p>Your SMTP connection works.</p><p>This message was sent from Cosmora.</p>",
    });

    revalidatePath("/dashboard/smtp");
    return ok(undefined, `Test email sent to ${recipient}.`);
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function deleteSmtpAccountAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const id = parseString(formData.get("id"));
  if (!id) return fail("Account id is required.");

  const account = await prisma.smtpAccount.findFirst({
    where: { id, userId: user.id },
  });
  if (!account) return fail("That SMTP account no longer exists.");

  const inUse = await prisma.campaign.count({ where: { smtpAccountId: id } });

  if (inUse > 0) {
    await prisma.campaign.updateMany({
      where: { smtpAccountId: id },
      data: { smtpAccountId: null },
    });
  }

  await prisma.smtpAccount.delete({ where: { id } });
  revalidatePath("/dashboard/smtp");
  return ok(undefined, "SMTP account removed.");
}

export async function setDefaultSmtpAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const id = parseString(formData.get("id"));
  if (!id) return fail("Account id is required.");

  const account = await prisma.smtpAccount.findFirst({
    where: { id, userId: user.id },
  });
  if (!account) return fail("That SMTP account no longer exists.");

  await prisma.smtpAccount.updateMany({
    where: { userId: user.id },
    data: { isDefault: false },
  });
  await prisma.smtpAccount.update({ where: { id }, data: { isDefault: true } });

  revalidatePath("/dashboard/smtp");
  return ok(undefined, "Default sending account updated.");
}

/* ==========================================================================
   Email composition
   ========================================================================== */

export async function generateEmailAction(
  _prev: ActionResult<GeneratedEmail> | null,
  formData: FormData
): Promise<ActionResult<GeneratedEmail>> {
  await requireUser();

  const productOrService = parseString(formData.get("productOrService"));
  if (!productOrService) return fail("Describe what you are selling.");

  try {
    return ok(
      await generateEmail({
        productOrService,
        valueProposition: parseString(formData.get("valueProposition")) ?? "",
        tone: parseString(formData.get("tone")) ?? "Professional and concise",
        audience: parseString(formData.get("audience")) ?? "business decision makers",
        callToAction: parseString(formData.get("callToAction")) ?? "Book a short call",
        senderName: parseString(formData.get("senderName")) ?? "",
        companyName: parseString(formData.get("companyName")) ?? "",
        instructions: parseString(formData.get("instructions")) ?? undefined,
      }),
      "Email generated."
    );
  } catch (error) {
    return fail(messageOf(error));
  }
}

export async function saveEmailTemplateAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const name = parseString(formData.get("name"));
  const subject = parseString(formData.get("subject"));
  const htmlBody = parseString(formData.get("htmlBody")) ?? "";
  const mode = parseString(formData.get("mode"));

  if (!name) return fail("Give the template a name.");
  if (!htmlBody.trim()) return fail("The email body cannot be empty.");
  if (!subject?.trim()) return fail("A subject line is required.");

  const modes = ["AI", "VISUAL", "HTML"] as const;
  const templateMode = modes.includes(mode as (typeof modes)[number])
    ? (mode as (typeof modes)[number])
    : "HTML";

  const blocks = parseString(formData.get("blocks"));

  try {
    let parsedBlocks: unknown = undefined;
    if (blocks) {
      try {
        parsedBlocks = JSON.parse(blocks);
      } catch {
        parsedBlocks = blocks;
      }
    }

    const template = await prisma.emailTemplate.create({
          data: {
            name,
            mode: templateMode,
            subject,
            htmlBody,
            blocks: parsedBlocks as never,
          },
        });

    revalidatePath("/dashboard/builder");
    return ok({ id: template.id }, "Template saved.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

/* ==========================================================================
   Campaigns
   ========================================================================== */

export async function createCampaignAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();

  const name = parseString(formData.get("name"));
  const subject = parseString(formData.get("subject"));
  const htmlBody = parseString(formData.get("htmlBody"));

  if (!name) return fail("Give the campaign a name.");
  if (!subject?.trim()) return fail("A subject line is required.");
  if (!htmlBody?.trim()) return fail("The email body cannot be empty.");

  const contactIds = formData.getAll("contactIds").map(String);
  const meetingLink = parseString(formData.get("meetingLink"));
    const smtpAccountId = parseString(formData.get("smtpAccountId"));

    // The chosen sending account must belong to this user.
    if (smtpAccountId) {
      const account = await prisma.smtpAccount.findFirst({
        where: { id: smtpAccountId, userId: user.id },
        select: { id: true },
      });

      if (!account) {
        return fail("That sending account no longer exists.");
      }
    }

    try {
      const mode = parseString(formData.get("mode"));
      const modes = ["AI", "VISUAL", "HTML"] as const;

      const campaign = await prisma.campaign.create({
        data: {
          name,
          description: parseString(formData.get("description")),
          subject,
          htmlBody,
          textBody: htmlToText(htmlBody),
          templateMode: modes.includes(mode as (typeof modes)[number])
            ? (mode as (typeof modes)[number])
            : "HTML",
          userId: user.id,
          organizationId: user.organizationId,
          smtpAccountId,
          aiInstructions: parseString(formData.get("aiInstructions")),
          personalization: {
            meetingLink,
            tokens: parseList(formData.get("tokens")),
          } as never,
          dailyLimit: parseNumber(formData.get("dailyLimit")) ?? 100,
          sendDelaySec: parseNumber(formData.get("sendDelaySec")) ?? 2,
          maxRetries: parseNumber(formData.get("maxRetries")) ?? 2,
        },
      });

      // Only contacts the user has unlocked may be added to a campaign.
      const contacts =
        contactIds.length > 0
          ? await prisma.contact.findMany({
              where: {
                id: { in: contactIds },
                company: {
                  leads: { some: { unlocks: { some: { userId: user.id } } } },
                },
              },
              select: { id: true },
            })
          : [];

      if (contacts.length > 0) {
        await prisma.campaignLead.createMany({
          data: contacts.map((contact) => ({
            campaignId: campaign.id,
            contactId: contact.id,
          })),
        });
      }

      revalidatePath("/dashboard/campaigns");

      if (contacts.length === 0) {
        return ok(
          { id: campaign.id },
          "Campaign created with no recipients. Add leads before sending."
        );
      }

      const skipped = contactIds.length - contacts.length;
      const plural = contacts.length === 1 ? "" : "s";

      return ok(
        { id: campaign.id },
        skipped > 0
          ? `Campaign created with ${contacts.length} recipient${plural}. ${skipped} skipped because they are not unlocked.`
          : `Campaign created with ${contacts.length} recipient${plural}.`
      );
    } catch (error) {
      return fail(messageOf(error));
    }
  }

export async function updateCampaignStatusAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();

  const campaignId = parseString(formData.get("campaignId"));
  const action = parseString(formData.get("action"));

  if (!campaignId || !action) return fail("Campaign and action are required.");

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, userId: user.id },
  });
  if (!campaign) return fail("You do not have access to that campaign.");

  try {
    if (action === "pause") {
      if (campaign.status !== "SENDING") {
        return fail("Only a sending campaign can be paused.");
      }
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "PAUSED", pausedAt: new Date() },
      });
      revalidatePath(`/dashboard/campaigns/${campaignId}`);
      return ok(undefined, "Campaign paused.");
    }

    if (action === "resume") {
      if (campaign.status !== "PAUSED") {
        return fail("Only a paused campaign can be resumed.");
      }
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "SENDING", pausedAt: null },
      });
      revalidatePath(`/dashboard/campaigns/${campaignId}`);
      return ok(undefined, "Campaign resumed.");
    }

    if (action === "schedule") {
      const scheduledAt = parseString(formData.get("scheduledAt"));

      if (!scheduledAt) return fail("Choose a send time.");
      if (Number.isNaN(new Date(scheduledAt).getTime())) {
        return fail("That send time is not valid.");
      }

      const date = new Date(scheduledAt);
      if (date.getTime() <= Date.now()) {
        return fail("Choose a time in the future.");
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "SCHEDULED", scheduledAt: date },
      });

      revalidatePath(`/dashboard/campaigns/${campaignId}`);
      return ok(undefined, "Campaign scheduled.");
    }

    if (action === "start") {
      if (campaign.status === "SENDING") {
        return fail("This campaign is already sending.");
      }
      if (!campaign.smtpAccountId) {
        return fail("Connect an SMTP account before sending.");
      }

      const recipientCount = await prisma.campaignLead.count({
        where: { campaignId },
      });

      if (recipientCount === 0) {
        return fail("Add at least one lead before sending.");
      }

      const queued = await prisma.emailQueue.count({
        where: { campaignId, status: "QUEUED" },
      });

      if (queued === 0) {
        await queueCampaignRecipients(campaignId, user.id);
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "SENDING", startedAt: new Date(), pausedAt: null },
      });

      revalidatePath(`/dashboard/campaigns/${campaignId}`);
      return ok(undefined, "Campaign started.");
    }

    if (action === "cancel") {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "CANCELLED" },
      });
      await prisma.emailQueue.updateMany({
        where: { campaignId, status: "QUEUED" },
        data: { status: "FAILED", lastError: "Campaign cancelled" },
      });

      revalidatePath(`/dashboard/campaigns/${campaignId}`);
      return ok(undefined, "Campaign cancelled.");
    }

    return fail("Unsupported campaign action.");
  } catch (error) {
    return fail(messageOf(error));
  }
}

/**
 * Creates one queue row per campaign recipient, skipping suppressed addresses.
 */
async function queueCampaignRecipients(campaignId: string, userId: string) {
  const { randomBytes } = await import("crypto");

  const recipients = await prisma.campaignLead.findMany({
    where: { campaignId },
    include: { contact: true },
  });

  for (const recipient of recipients) {
    const email = recipient.contact.email.toLowerCase();

    const suppression = await prisma.suppression.findUnique({ where: { email } });
    if (suppression) continue;

    const existing = await prisma.emailQueue.findFirst({
      where: { campaignId, emailAddress: email },
    });
    if (existing) continue;

    await prisma.emailQueue.create({
      data: {
        campaignId,
        contactId: recipient.contactId,
        emailAddress: email,
        trackingToken: randomBytes(16).toString("hex"),
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action: "campaign.queue",
      entityType: "Campaign",
      entityId: campaignId,
    },
  });
}

export async function deleteCampaignAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const id = parseString(formData.get("id"));
  if (!id) return fail("Campaign id is required.");

  const campaign = await prisma.campaign.findFirst({
    where: { id, userId: user.id },
  });
  if (!campaign) return fail("You do not have access to that campaign.");

  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/dashboard/campaigns");
  return ok(undefined, "Campaign deleted.");
}