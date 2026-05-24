import { getSettingsForAdmin } from "@/modules/admin/services/platformSettings.service.js";

const SECURITY_PUBLIC_KEYS = [
  "maxLoginAttempts",
  "lockoutDuration",
  "minPasswordLength",
  "requireUppercase",
  "requireNumber",
  "requireSpecialChar",
  "rateLimitPerMinute",
] as const;

export async function getAdminSettingsSlim() {
  const settings = await getSettingsForAdmin();
  const security = settings.security as Record<string, unknown> | undefined;
  const publicSecurity: Record<string, unknown> = {};
  if (security) {
    for (const key of SECURITY_PUBLIC_KEYS) {
      if (security[key] !== undefined) publicSecurity[key] = security[key];
    }
  }

  return {
    platform: settings.platform,
    fees: settings.fees,
    events: settings.events,
    organizers: settings.organizers,
    tracking: settings.tracking,
    security: publicSecurity,
    cacheLastClearedAt: settings.cacheLastClearedAt,
    updatedAt: settings.updatedAt,
  };
}
