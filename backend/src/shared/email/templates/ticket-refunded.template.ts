import { cardBlock, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface TicketRefundedVars {
  buyerName: string;
  eventTitle: string;
  orderId: string;
  refundAmount: string;
  paymentMethod: string;
}

const SUBJECT = "💰 Refund Processed — {{eventTitle}}";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{buyerName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">Your refund has been processed.</p>
${cardBlock(`
  <p style="margin:0 0 8px;">Amount: ৳{{refundAmount}}</p>
  <p style="margin:0 0 8px;">Payment method: {{paymentMethod}}</p>
  <p style="margin:0;">Order ID: #{{orderId}}</p>
`)}
<p style="color:#94a3b8;margin:16px 0 0;">Refunds may take 3–5 business days.</p>
`;

export function ticketRefundedTemplate(vars: TicketRefundedVars) {
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(renderTemplate(BODY, vars)),
  };
}
