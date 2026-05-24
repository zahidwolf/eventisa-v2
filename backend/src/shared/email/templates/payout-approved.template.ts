import { cardBlock, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface PayoutApprovedVars {
  organizerName: string;
  amount: string;
  method: string;
  payoutsUrl: string;
}

const SUBJECT = "✅ Payout approved — ৳{{amount}}";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{organizerName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">Your payout request has been approved. Admin will process payment shortly.</p>
${cardBlock(`
  <p style="margin:0 0 8px;">Amount: ৳{{amount}}</p>
  <p style="margin:0;">Payout to: {{method}}</p>
`)}
<p style="margin:20px 0 0;"><a href="{{payoutsUrl}}" style="color:#FF3EA5;">View payout status</a></p>
`;

export function payoutApprovedTemplate(vars: PayoutApprovedVars) {
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(renderTemplate(BODY, vars)),
  };
}
