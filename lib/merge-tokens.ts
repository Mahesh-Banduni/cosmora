/**
 * Merge tokens available in every email mode.
 *
 * Kept free of server-only imports so client components can render the
 * token picker without pulling in the personalization runtime.
 */
export const MERGE_TOKENS = [
  { token: "{{firstName}}", label: "First name", source: "contact.firstName" },
  { token: "{{lastName}}", label: "Last name", source: "contact.lastName" },
  { token: "{{company}}", label: "Company", source: "company.name" },
  { token: "{{jobTitle}}", label: "Job title", source: "contact.jobTitle" },
  { token: "{{industry}}", label: "Industry", source: "company.industry" },
  { token: "{{country}}", label: "Country", source: "company.country" },
  { token: "{{state}}", label: "State", source: "company.state" },
  { token: "{{city}}", label: "City", source: "company.city" },
  { token: "{{website}}", label: "Website", source: "company.website" },
  { token: "{{senderName}}", label: "Sender name", source: "smtp.fromName" },
  { token: "{{senderCompany}}", label: "Sender company", source: "sender.organization" },
  { token: "{{senderEmail}}", label: "Sender email", source: "smtp.fromEmail" },
  { token: "{{meetingLink}}", label: "Meeting link", source: "campaign.meetingLink" },
] as const;