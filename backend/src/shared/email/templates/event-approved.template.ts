import { ctaButton, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface EventApprovedVars {
  organizerName: string;
  eventTitle: string;
  eventUrl: string;
  dashboardUrl: string;
}

const SUBJECT = "✅ Your Event Is Live — {{eventTitle}}";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{organizerName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">Your event {{eventTitle}} has been approved and is now live on Eventisa!</p>
<p style="margin:20px 0 12px;">{{cta}}</p>
<p style="color:#94a3b8;margin:0;">Share it with your audience and start selling tickets.</p>
`;

export function eventApprovedTemplate(vars: EventApprovedVars) {
  const cta = ctaButton(vars.eventUrl, "View Event");
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(renderTemplate(BODY, { ...vars, cta })),
  };
}
