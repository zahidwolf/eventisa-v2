import { cardBlock, ctaButton, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface NewBookingVars {
  organizerName: string;
  eventTitle: string;
  buyerName: string;
  segmentName: string;
  quantity: string;
  amount: string;
  dashboardUrl: string;
}

const SUBJECT = "🎟️ New Booking — {{eventTitle}}";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{organizerName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">You have a new booking!</p>
${cardBlock(`
  <p style="margin:0 0 8px;">Event: {{eventTitle}}</p>
  <p style="margin:0 0 8px;">Buyer: {{buyerName}}</p>
  <p style="margin:0 0 8px;">Segment: {{segmentName}} × {{quantity}}</p>
  <p style="margin:0;">Amount: ৳{{amount}}</p>
`)}
<p style="margin:20px 0 0;">{{cta}}</p>
`;

export function newBookingTemplate(vars: NewBookingVars) {
  const cta = ctaButton(vars.dashboardUrl, "View Attendees");
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(renderTemplate(BODY, { ...vars, cta })),
  };
}
