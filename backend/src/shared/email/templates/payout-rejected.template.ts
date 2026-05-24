import { cardBlock, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface PayoutRejectedVars {
  organizerName: string;
  amount: string;
  reason: string;
  payoutsUrl: string;
}

const SUBJECT = "Payout request update";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{organizerName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">Your payout request could not be approved at this time.</p>
${cardBlock(`
  <p style="margin:0 0 8px;">Requested amount: ৳{{amount}}</p>
  <p style="margin:0;">Reason: {{reason}}</p>
`)}
<p style="color:#94a3b8;margin:20px 0 0;">You can submit a new request from your payouts page.</p>
<p style="margin:12px 0 0;"><a href="{{payoutsUrl}}" style="color:#FF3EA5;">Go to Payouts</a></p>
`;

export function payoutRejectedTemplate(vars: PayoutRejectedVars) {
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(renderTemplate(BODY, vars)),
  };
}
