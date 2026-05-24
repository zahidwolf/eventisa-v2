import nodemailer, { type Transporter } from "nodemailer";
import { getSmtpConfig, isEmailConfigured } from "@/shared/email/email.config.js";
import { renderTemplate } from "@/shared/email/email-layout.js";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const cfg = getSmtpConfig();
  if (!cfg) return null;

  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
  });
  return transporter;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: EmailAttachment[]
): Promise<boolean> {
  const cfg = getSmtpConfig();
  const tx = getTransporter();
  if (!cfg || !tx) {
    console.error("Email failed: SMTP not configured");
    return false;
  }

  try {
    await tx.sendMail({
      from: cfg.from,
      to,
      subject,
      html,
      attachments: attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType ?? "application/octet-stream",
      })),
    });
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Email failed:", message);
    return false;
  }
}

export { renderTemplate };

export async function verifyConnection(): Promise<void> {
  if (!isEmailConfigured()) {
    console.log("SMTP connection skipped: SMTP_HOST, SMTP_USER, or SMTP_PASS not set");
    return;
  }

  const cfg = getSmtpConfig();
  const tx = getTransporter();
  if (!tx || !cfg) return;

  try {
    await tx.verify();
    console.log("SMTP connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`SMTP connection failed: ${message}`);
  }
}
