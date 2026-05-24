import { cacheDel } from "@/shared/cache/cache.service.js";

export const ADMIN_NAV_COUNTS_KEY = "admin_nav_counts";
export const ADMIN_FINANCE_OVERVIEW_KEY = "admin_finance_overview";

export function invalidateAdminNavCountsCache(): void {
  cacheDel(ADMIN_NAV_COUNTS_KEY);
}

export function invalidateAdminFinanceOverviewCache(): void {
  cacheDel(ADMIN_FINANCE_OVERVIEW_KEY);
}

export function invalidateAdminCachesOnModeration(): void {
  invalidateAdminNavCountsCache();
  invalidateAdminFinanceOverviewCache();
}
