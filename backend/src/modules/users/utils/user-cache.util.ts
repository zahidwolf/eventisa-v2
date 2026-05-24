import { cacheDel } from "@/shared/cache/cache.service.js";

export const USER_DASHBOARD_PREFIX = "user_dashboard_";

export function userDashboardCacheKey(userId: string): string {
  return `${USER_DASHBOARD_PREFIX}${userId}`;
}

export function invalidateUserDashboardCache(userId: string | undefined): void {
  if (!userId) return;
  cacheDel(userDashboardCacheKey(userId));
}
