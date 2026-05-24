export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export function getFrontendUrl(): string {
  return process.env.FRONTEND_URL ?? process.env.CLIENT_URL ?? "http://localhost:3000";
}

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    user,
    pass,
    from: process.env.SMTP_FROM ?? `"Eventisa" <${user}>`,
  };
}

export function isEmailConfigured(): boolean {
  return getSmtpConfig() !== null;
}
