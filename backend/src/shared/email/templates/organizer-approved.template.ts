import { ctaButton, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface OrganizerApprovedVars {
  organizerName: string;
  dashboardUrl: string;
}

const SUBJECT = "🎉 Welcome to Eventisa — You're Approved!";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{organizerName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">Your organizer application has been approved! You can now create and publish events on Eventisa.</p>
<p style="margin:20px 0 12px;">{{cta}}</p>
<p style="color:#94a3b8;margin:0;">Start creating your first event today.</p>
`;

export function organizerApprovedTemplate(vars: OrganizerApprovedVars) {
  const cta = ctaButton(vars.dashboardUrl, "Go to Dashboard");
  return {
    subject: SUBJECT,
    html: emailLayout(renderTemplate(BODY, { ...vars, cta })),
  };
}
