import { ctaButton, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface EmailVerificationVars {
  userName: string;
  verificationUrl: string;
  expiryHours: string;
}

const SUBJECT = "Verify your Eventisa account";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{userName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">
  Welcome to Eventisa! Please verify your email address to activate your account.
</p>
<p style="margin:24px 0;text-align:center;">{{cta}}</p>
<p style="color:#94a3b8;margin:0 0 12px;font-size:14px;">
  This link expires in {{expiryHours}} hours.
</p>
<p style="color:#64748b;margin:0;font-size:13px;">
  If you didn't create an account, you can safely ignore this email.
</p>
`;

export function emailVerificationTemplate(vars: EmailVerificationVars) {
  const cta = ctaButton(vars.verificationUrl, "Verify My Email");
  const inner = renderTemplate(BODY, { ...vars, cta });
  return {
    subject: SUBJECT,
    html: emailLayout(inner),
  };
}
