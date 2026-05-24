import { cardBlock, ctaButton, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface EventReminderVars {
  buyerName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  segmentName: string;
  ticketUrl: string;
}

const SUBJECT = "⏰ Tomorrow: {{eventTitle}}";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{buyerName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">Your event is tomorrow!</p>
${cardBlock(`
  <p style="margin:0 0 8px;">📅 {{eventDate}} at {{eventTime}}</p>
  <p style="margin:0 0 8px;">📍 {{eventVenue}}</p>
  <p style="margin:0;">🎟️ {{segmentName}}</p>
`)}
<p style="margin:20px 0 12px;">{{cta}}</p>
<p style="color:#94a3b8;margin:0;font-size:13px;">Your ticket PDF is attached — show the QR code at entry.</p>
`;

export function eventReminderTemplate(vars: EventReminderVars) {
  const cta = ctaButton(vars.ticketUrl, "View My Ticket");
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(renderTemplate(BODY, { ...vars, cta })),
  };
}
