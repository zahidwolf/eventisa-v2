import { cardBlock, ctaButton, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface PayoutRequestedVars {
  organizerName: string;
  organizationName: string;
  amount: string;
  eventsCount: string;
  reviewUrl: string;
}

const SUBJECT = "New payout request — ৳{{amount}}";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">A new payout request needs review.</p>
${cardBlock(`
  <p style="margin:0 0 8px;">Organizer: {{organizerName}}</p>
  <p style="margin:0 0 8px;">Organization: {{organizationName}}</p>
  <p style="margin:0 0 8px;">Amount: ৳{{amount}}</p>
  <p style="margin:0;">Events: {{eventsCount}}</p>
`)}
<p style="margin:20px 0 0;">{{cta}}</p>
`;

export function payoutRequestedTemplate(vars: PayoutRequestedVars) {
  const cta = ctaButton(vars.reviewUrl, "Review Request");
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(renderTemplate(BODY, { ...vars, cta })),
  };
}
