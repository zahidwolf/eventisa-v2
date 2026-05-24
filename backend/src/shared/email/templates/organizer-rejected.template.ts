import { emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface OrganizerRejectedVars {
  organizerName: string;
  reason: string;
}

const SUBJECT = "Update on Your Eventisa Organizer Application";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{organizerName}},</p>
<p style="color:#94a3b8;margin:0 0 16px;">We've reviewed your organizer application and are unable to approve it at this time.</p>
<p style="color:#e2e8f0;margin:0 0 16px;">Reason: {{reason}}</p>
<p style="color:#94a3b8;margin:0;">If you have questions, reply to this email.</p>
`;

export function organizerRejectedTemplate(vars: OrganizerRejectedVars) {
  return {
    subject: SUBJECT,
    html: emailLayout(renderTemplate(BODY, vars)),
  };
}
