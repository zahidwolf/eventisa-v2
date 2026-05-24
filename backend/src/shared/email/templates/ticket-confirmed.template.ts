import { cardBlock, ctaButton, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface TicketConfirmedVars {
  buyerName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  segmentName: string;
  quantity: string;
  totalAmount: string;
  orderId: string;
  ticketUrl: string;
}

const SUBJECT = "✅ Ticket Confirmed — {{eventTitle}}";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{buyerName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">Your ticket is confirmed!</p>
${cardBlock(`
  <p style="margin:0 0 8px;">📅 {{eventDate}} at {{eventTime}}</p>
  <p style="margin:0 0 8px;">📍 {{eventVenue}}</p>
  <p style="margin:0 0 8px;">🎟️ {{segmentName}} × {{quantity}}</p>
  <p style="margin:0;">💰 Total: ৳{{totalAmount}}</p>
`)}
<p style="color:#94a3b8;margin:16px 0 8px;">Order ID: #{{orderId}}</p>
<p style="color:#94a3b8;margin:0 0 16px;font-size:13px;">Your ticket PDF is attached — open it from this email or save it to your phone before the event.</p>
<p style="margin:20px 0 12px;">{{cta}}</p>
<p style="color:#94a3b8;margin:0;font-size:13px;">Show the QR code from your PDF at the entrance.</p>
`;

export function ticketConfirmedTemplate(vars: TicketConfirmedVars) {
  const cta = ctaButton(vars.ticketUrl, "View Your Ticket");
  const inner = renderTemplate(BODY, { ...vars, cta });
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(inner),
  };
}
