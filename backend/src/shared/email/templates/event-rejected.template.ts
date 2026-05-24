import { ctaButton, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface EventRejectedVars {
  organizerName: string;
  eventTitle: string;
  reason: string;
  editUrl: string;
}

const SUBJECT = "Changes Needed — {{eventTitle}}";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{organizerName}},</p>
<p style="color:#94a3b8;margin:0 0 16px;">Your event {{eventTitle}} needs some changes before it can be published.</p>
<p style="color:#e2e8f0;margin:0 0 20px;">Reason: {{reason}}</p>
<p style="margin:0;">{{cta}}</p>
`;

export function eventRejectedTemplate(vars: EventRejectedVars) {
  const cta = ctaButton(vars.editUrl, "Edit Event");
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(renderTemplate(BODY, { ...vars, cta })),
  };
}
