import { cardBlock, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface PayoutPaidVars {
  organizerName: string;
  amount: string;
  txRef: string;
  paymentMethod: string;
  payoutsUrl: string;
}

const SUBJECT = "💰 Payout processed — ৳{{amount}}";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{organizerName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">Funds have been sent to your account.</p>
${cardBlock(`
  <p style="margin:0 0 8px;">Amount: ৳{{amount}}</p>
  <p style="margin:0 0 8px;">Method: {{paymentMethod}}</p>
  <p style="margin:0;">Reference: {{txRef}}</p>
`)}
<p style="margin:20px 0 0;"><a href="{{payoutsUrl}}" style="color:#FF3EA5;">View payout history</a></p>
`;

export function payoutPaidTemplate(vars: PayoutPaidVars) {
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(renderTemplate(BODY, vars)),
  };
}
