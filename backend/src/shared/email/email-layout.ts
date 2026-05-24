export function renderTemplate(
  template: string,
  variables: Record<string, string | number | undefined> | object
): string {
  const map = variables as Record<string, string | number | undefined>;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = map[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

export function ctaButton(href: string, label: string): string {
  return `<a href="${href}" style="background:#ec4899;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold;font-family:Arial,sans-serif;">${label}</a>`;
}

export function emailLayout(contentHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;padding:24px 12px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="background:#1a1a2e;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
  <div style="font-size:26px;font-weight:bold;color:#ec4899;letter-spacing:2px;">EVENTISA</div>
  <div style="font-size:13px;color:#94a3b8;margin-top:6px;">Bangladesh's Premier Event Platform</div>
</td></tr>
<tr><td style="background:#1a1a2e;padding:8px 32px 32px;color:#ffffff;font-size:15px;line-height:1.6;">
${contentHtml}
</td></tr>
<tr><td style="background:#0f0f1a;padding:24px 8px;text-align:center;font-size:12px;color:#94a3b8;line-height:1.5;">
  <p style="margin:0 0 8px;">© 2025 Eventisa — Bangladesh's Premier Event Platform</p>
  <p style="margin:0 0 8px;">eventisa.contact@gmail.com</p>
  <p style="margin:0;">You received this email because of activity on your Eventisa account.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function cardBlock(html: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f1a;border-radius:8px;margin:16px 0;"><tr><td style="padding:16px 20px;color:#e2e8f0;font-size:14px;line-height:1.7;">${html}</td></tr></table>`;
}
