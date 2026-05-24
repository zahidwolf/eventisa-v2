import { cardBlock, emailLayout, renderTemplate } from "@/shared/email/email-layout.js";

export interface EventCancelledVars {
  buyerName: string;
  eventTitle: string;
  eventDate: string;
  refundInfo: string;
}

const SUBJECT = "{{eventTitle}} Has Been Cancelled";
const BODY = `
<p style="color:#ffffff;margin:0 0 12px;">Hi {{buyerName}},</p>
<p style="color:#94a3b8;margin:0 0 20px;">We're sorry — {{eventTitle}} on {{eventDate}} has been cancelled.</p>
{{refundBlock}}
<p style="color:#94a3b8;margin:16px 0 0;">We apologize for the inconvenience.</p>
`;

export function eventCancelledTemplate(vars: EventCancelledVars) {
  const refundBlock = vars.refundInfo.trim()
    ? cardBlock(`<p style="margin:0;">${vars.refundInfo}</p>`)
    : "";
  return {
    subject: renderTemplate(SUBJECT, vars),
    html: emailLayout(renderTemplate(BODY, { ...vars, refundBlock })),
  };
}
