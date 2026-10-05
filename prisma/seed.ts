/**
 * Seeds one administrator, one regular user, and at least one row in every
 * table so the whole app can be exercised end to end.
 *
 * Usage: npm run seed
 *
 * Safe to run repeatedly: the script clears the tables it owns before
 * inserting, so re-running always yields the same deterministic dataset.
 */
import "dotenv/config";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

const PASSWORD = "Cosmora123!";

// A valid ENCRYPTION_KEY is required so the demo SMTP account can be decrypted.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 16) {
  throw new Error(
    "ENCRYPTION_KEY must be set (any passphrase; 64 hex chars are hashed to the AES key)."
  );
}

async function encryptSecret(plaintext: string): Promise<string> {
  const { createCipheriv, createHash, randomBytes: random } = await import("crypto");

  const raw = ENCRYPTION_KEY!.trim();
  const key = /^[0-9a-fA-F]{64}$/.test(raw)
    ? Buffer.from(raw, "hex")
    : createHash("sha256").update(raw).digest();

  const iv = random(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return [
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

/* ==========================================================================
   Reference data
   ========================================================================== */

const COMPANY = {
  name: "Northwind Analytics",
  domain: "northwind.io",
  website: "https://northwind.io",
  industry: "Software",
  description: "Product analytics platform for mid-market B2B SaaS teams.",
  employeeCount: 240,
  revenueMin: 28_000_000,
  revenueMax: 32_000_000,
  country: "United States",
  state: "California",
  city: "San Francisco",
  address: "500 Howard Street",
  postalCode: "94105",
  technologies: ["React", "Node.js", "PostgreSQL"] as string[],
  keywords: ["analytics", "saas", "b2b"] as string[],
};

const CONTACT = {
  firstName: "Dana",
  lastName: "Whitfield",
  jobTitle: "VP of Sales",
  department: "Sales",
  email: "dana.whitfield@northwind.io",
  phone: "+1 415 555 0134",
  linkedinUrl: "https://linkedin.com/in/dana-whitfield",
} as const;

const EMAIL_HTML = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><title>Quick question</title></head>
<body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#191500;background:#f5f5f5;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e5e5;border-radius:16px;">
    <tr><td style="padding:32px;">
      <h1 style="margin:0 0 16px;font-size:24px;">A quick idea for {{company}}</h1>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3b3b3b;">
        Hi {{firstName}}, we help {{jobTitle}} teams like {{industry}} companies cut
        manual reporting. Worth 15 minutes?
      </p>
      <p style="margin:0 0 24px;">
        <a href="{{meetingLink}}" style="background:#191500;color:#ffffff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">Book a quick call</a>
      </p>
      <p style="margin:0;font-size:14px;color:#5d5d55;">{{senderName}}<br />{{senderCompany}}</p>
    </td></tr>
  </table>
</body>
</html>`;

const TEMPLATE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><title>Template</title></head>
<body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;">
  <p style="font-size:16px;color:#3b3b3b;">Hi {{firstName}},</p>
  <p style="font-size:16px;color:#3b3b3b;">Here is the resource you asked about.</p>
</body></html>`;

/* ==========================================================================
   Seed
   ========================================================================== */

async function clearExisting() {
  // Order matters: children are removed before the parents they reference.
  await prisma.emailEvent.deleteMany();
  await prisma.emailQueue.deleteMany();
  await prisma.campaignLead.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.smtpAccount.deleteMany();

  await prisma.leadNote.deleteMany();
  await prisma.leadTag.deleteMany();
  await prisma.savedLead.deleteMany();
  await prisma.leadUnlock.deleteMany();
  await prisma.leadScore.deleteMany();
  await prisma.leadMatch.deleteMany();
  await prisma.lead.deleteMany();

  await prisma.contact.deleteMany();
  await prisma.companyCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.company.deleteMany();

  await prisma.creditTransaction.deleteMany();
  await prisma.icp.deleteMany();
  await prisma.suppression.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.passwordResetToken.deleteMany();

  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

async function main() {
  await clearExisting();

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  /* ---------------------------------------------------------------- Org */
  const organization = await prisma.organization.create({
    data: { name: "Cosmora Demo Org", slug: "cosmora-demo-org" },
  });

  /* --------------------------------------------------------------- Users */
  const admin = await prisma.user.create({
    data: {
      name: "Cosmora Admin",
      email: "admin@cosmora.dev",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      organizationId: organization.id,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Demo Rep",
      email: "user@cosmora.dev",
      passwordHash,
      role: "USER",
      status: "ACTIVE",
      organizationId: organization.id,
    },
  });

  /* -------------------------------------------------- Password reset token */
  await prisma.passwordResetToken.create({
    data: {
      token: randomBytes(24).toString("hex"),
      userId: user.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  /* -------------------------------------------------------------- Credits */
  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      amount: 100,
      balanceAfter: 99,
      reason: "Welcome credits",
    },
  });

  // Net balance for the user is now 100 (100 granted, 1 spent on the unlock).
  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      amount: -1,
      balanceAfter: 99,
      reason: `Unlocked ${COMPANY.name}`,
    },
  });

  /* -------------------------------------------------------------- Company */
  const company = await prisma.company.create({
    data: { ...COMPANY, isVerified: true, qualityScore: 86, lastVerifiedAt: new Date() },
  });

  /* ------------------------------------------------------------- Category */
  const category = await prisma.category.create({
    data: {
      name: "B2B SaaS",
      description: "Software companies selling to other businesses.",
      color: "#fed731",
    },
  });

  await prisma.companyCategory.create({
    data: { companyId: company.id, categoryId: category.id },
  });

  /* ----------------------------------------------------- Import job record */
  const importJob = await prisma.importJob.create({
    data: {
      fileName: "northwind-leads.csv",
      status: "COMPLETED",
      totalRows: 1,
      importedRows: 1,
      duplicateRows: 0,
      invalidRows: 0,
      completedAt: new Date(),
      companies: { connect: { id: company.id } },
    },
  });

  /* -------------------------------------------------------------- Contact */
  const contact = await prisma.contact.create({
    data: {
      companyId: company.id,
      firstName: CONTACT.firstName,
      lastName: CONTACT.lastName,
      jobTitle: CONTACT.jobTitle,
      department: CONTACT.department,
      email: CONTACT.email,
      phone: CONTACT.phone,
      linkedinUrl: CONTACT.linkedinUrl,
      isVerified: true,
    },
  });

  /* ------------------------------------------------------------------ ICP */
  const icp = await prisma.icp.create({
    data: {
      name: "US B2B SaaS — mid market",
      description: "Mid-market B2B software companies in North America.",
      userId: user.id,
      organizationId: organization.id,
      naturalLanguageRequirements:
        "B2B SaaS companies with 50-500 employees in the US or UK that use React.",
      industries: ["Software"],
      countries: ["United States"],
      states: [],
      cities: [],
      jobTitles: ["VP of Sales", "Director of Growth"],
      technologies: ["React"],
      keywords: ["saas"],
      exclusions: [],
      sizeMin: 50,
      sizeMax: 500,
      isActive: true,
      lastMatchedAt: new Date(),
      matchCount: 1,
    },
  });

  /* ----------------------------------------------------------------- Lead */
  const lead = await prisma.lead.create({
    data: {
      companyId: company.id,
      contactId: contact.id,
      availability: "UNLOCKED",
      status: "CONTACTED",
      lastContactedAt: new Date(),
    },
  });

  await prisma.leadMatch.create({
    data: {
      leadId: lead.id,
      icpId: icp.id,
      matched: true,
      criteria: { matchedCriteria: ["industry", "country", "technology", "job title", "company size"] },
    },
  });

  await prisma.leadScore.create({
    data: {
      leadId: lead.id,
      icpId: icp.id,
      score: 92,
      icpMatchScore: 92,
      explanation:
        "Scored 92/100 against \"US B2B SaaS — mid market\". Matched on industry, country, technology, job title and company size.",
      breakdown: {
        matchedCriteria: ["industry", "country", "technology", "job title", "company size"],
      },
    },
  });

  await prisma.leadUnlock.create({
    data: { leadId: lead.id, userId: user.id, creditsUsed: 1 },
  });

  await prisma.savedLead.create({
    data: { leadId: lead.id, userId: user.id },
  });

  await prisma.leadTag.create({
    data: { leadId: lead.id, userId: user.id, name: "enterprise", color: "#fed731" },
  });

  await prisma.leadNote.create({
    data: {
      leadId: lead.id,
      userId: user.id,
      body: "Warm intro from the conference. Follow up after the QBR next week.",
    },
  });

  /* -------------------------------------------------------- SMTP + template */
  const smtp = await prisma.smtpAccount.create({
    data: {
      name: "Demo SMTP",
      host: "smtp.example.com",
      port: 587,
      secure: false,
      username: "demo@cosmora.dev",
      encryptedPassword: await encryptSecret("demo-smtp-password"),
      fromName: "Demo Rep",
      fromEmail: "user@cosmora.dev",
      replyTo: "reply@cosmora.dev",
      isDefault: true,
      isVerified: true,
      lastTestedAt: new Date(),
      lastTestResult: "Connection succeeded.",
      userId: user.id,
    },
  });

  const template = await prisma.emailTemplate.create({
    data: {
      name: "Demo outreach template",
      mode: "HTML",
      subject: "A quick idea for {{company}}",
      htmlBody: TEMPLATE_HTML,
      isSystem: false,
    },
  });

  /* -------------------------------------------------------------- Campaign */
  const campaign = await prisma.campaign.create({
    data: {
      name: "Demo outreach — Northwind",
      description: "Single-recipient campaign created by the seed.",
      status: "DRAFT",
      userId: user.id,
      organizationId: organization.id,
      smtpAccountId: smtp.id,
      subject: "A quick idea for {{company}}",
      htmlBody: EMAIL_HTML,
      templateId: template.id,
      templateMode: "HTML",
      personalization: {
        meetingLink: "https://cal.example.com/demo",
        tokens: ["{{firstName}}", "{{company}}", "{{jobTitle}}", "{{meetingLink}}"],
      },
      dailyLimit: 50,
      sendDelaySec: 2,
      maxRetries: 2,
      timezone: "UTC",
      approvalStatus: "NOT_REQUIRED",
    },
  });

  await prisma.campaignLead.create({
    data: {
      campaignId: campaign.id,
      contactId: contact.id,
      leadId: lead.id,
      status: "QUEUED",
    },
  });

  const email = await prisma.emailQueue.create({
    data: {
      campaignId: campaign.id,
      contactId: contact.id,
      emailAddress: CONTACT.email,
      status: "SENT",
      attempts: 1,
      sentAt: new Date(),
      deliveredAt: new Date(),
      messageId: `<seed-${randomBytes(8).toString("hex")}@cosmora.dev>`,
      trackingToken: randomBytes(16).toString("hex"),
    },
  });

  await prisma.emailEvent.create({
    data: {
      emailId: email.id,
      type: "DELIVERY",
      ipAddress: "203.0.113.10",
      userAgent: "seed",
    },
  });

  await prisma.emailEvent.create({
    data: {
      emailId: email.id,
      type: "OPEN",
      ipAddress: "203.0.113.10",
      userAgent: "seed",
    },
  });

  /* ---------------------------------------------------------- Suppression */
  await prisma.suppression.create({
    data: {
      email: "unsubscribed-lead@example.com",
      reason: "UNSUBSCRIBE",
      source: `email:${email.id}`,
    },
  });

  /* ------------------------------------------------------------ Audit logs */
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "company.import",
      entityType: "ImportJob",
      entityId: importJob.id,
      metadata: { imported: 1, duplicates: 0, fileName: "northwind-leads.csv" },
      ipAddress: "203.0.113.10",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "user.create",
      entityType: "User",
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
      ipAddress: "203.0.113.10",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "suppression.create",
      entityType: "Suppression",
      metadata: { email: "unsubscribed-lead@example.com", reason: "UNSUBSCRIBE" },
      ipAddress: "203.0.113.10",
    },
  });

  /* --------------------------------------------------------------- Summary */
  const counts = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.passwordResetToken.count(),
    prisma.creditTransaction.count(),
    prisma.company.count(),
    prisma.contact.count(),
    prisma.category.count(),
    prisma.companyCategory.count(),
    prisma.importJob.count(),
    prisma.icp.count(),
    prisma.lead.count(),
    prisma.leadMatch.count(),
    prisma.leadScore.count(),
    prisma.leadUnlock.count(),
    prisma.savedLead.count(),
    prisma.leadTag.count(),
    prisma.leadNote.count(),
    prisma.smtpAccount.count(),
    prisma.emailTemplate.count(),
    prisma.campaign.count(),
    prisma.campaignLead.count(),
    prisma.emailQueue.count(),
    prisma.emailEvent.count(),
    prisma.suppression.count(),
    prisma.auditLog.count(),
  ]);

  const labels = [
    "Organization",
    "User",
    "PasswordResetToken",
    "CreditTransaction",
    "Company",
    "Contact",
    "Category",
    "CompanyCategory",
    "ImportJob",
    "Icp",
    "Lead",
    "LeadMatch",
    "LeadScore",
    "LeadUnlock",
    "SavedLead",
    "LeadTag",
    "LeadNote",
    "SmtpAccount",
    "EmailTemplate",
    "Campaign",
    "CampaignLead",
    "EmailQueue",
    "EmailEvent",
    "Suppression",
    "AuditLog",
  ];

  console.log("\nSeed complete. Row counts per table:");
  labels.forEach((label, index) => {
    const count = counts[index] ?? 0;
    console.log(`  ${count > 0 ? "OK " : "MISS"}  ${label.padEnd(20)} ${count}`);
  });

  const empty = labels.filter((_, index) => (counts[index] ?? 0) === 0);
  if (empty.length > 0) {
    console.error(`\nEmpty tables: ${empty.join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log("\nEvery table has at least one row.");
  }

  console.log("\nSign in with:");
  console.log("  Admin: admin@cosmora.dev");
  console.log("  User:  user@cosmora.dev");
  console.log(`  Password: ${PASSWORD}`);
  console.log("\nStart the queue processor (PowerShell):");
  console.log("  Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/queue/process -Headers @{ Authorization = 'Bearer $env:QUEUE_SECRET' }");
  console.log("\nStart the queue processor (bash):");
  console.log("  curl -X POST http://localhost:3000/api/queue/process -H 'Authorization: Bearer $QUEUE_SECRET'");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
