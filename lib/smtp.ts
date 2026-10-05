import nodemailer from "nodemailer";
import { decryptSecret } from "@/lib/crypto";

export type SmtpConnectionInput = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string | null;
};

export function buildTransport(config: SmtpConnectionInput) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  });
}

/** Connection-level check that does not deliver a message. */
export async function testSmtpConnection(config: SmtpConnectionInput) {
  const transport = buildTransport(config);

  try {
    await transport.verify();
    return { ok: true as const, message: "Connection succeeded." };
  } catch (error) {
    return {
      ok: false as const,
      message: error instanceof Error ? error.message : "Connection failed.",
    };
  }
}

/**
 * Normalizes nodemailer send failures into a delivery outcome we can persist.
 */
export function classifySendError(error: unknown): {
  outcome: "BOUNCED" | "FAILED";
  message: string;
} {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code ?? "")
      : "";
  const responseCode =
    typeof error === "object" && error !== null && "responseCode" in error
      ? Number((error as { responseCode?: unknown }).responseCode ?? 0)
      : 0;
  const message = error instanceof Error ? error.message : "Unknown SMTP error.";

  const permanent =
    code === "EENVELOPE" ||
    responseCode >= 500 ||
    /5\d\d/.test(message) ||
    /does not exist|not found|invalid recipient|mailbox unavailable/i.test(message);

  return {
    outcome: permanent ? "BOUNCED" : "FAILED",
    message: message.slice(0, 500),
  };
}

export function describeSmtpError(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown SMTP error.";
}

export { decryptSecret };