import { cardBlock, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface TicketCancelledVars {
  buyerName: string;
  eventTitle: string;
  orderId: string;
  reason: string;
}

const SUBJECT = "Booking Cancelled — {{eventTitle}}";

export function ticketCancelledTemplate(vars: TicketCancelledVars) {
  const reasonLine = vars.reason.trim()
    ? `<p style="margin:8px 0 0;">Reason: ${vars.reason}</p>`
    : "";
  const body = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{buyerName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">Your booking has been cancelled.</p>
${cardBlock(`
  <p style="margin:0;">Event: {{eventTitle}}</p>
  <p style="margin:8px 0 0;">Order ID: #{{orderId}}</p>
  ${reasonLine}
`)}
<p style="color:#94a3b8;margin:16px 0 0;">Contact us if you have questions.</p>
`;
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(renderTemplate(body, vars)),
  };
}
