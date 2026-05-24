import { cacheDel } from "@/shared/cache/cache.service.js";

export const ORG_DASHBOARD_PREFIX = "org_dashboard_";
export const ORG_PAYOUT_SUMMARY_PREFIX = "org_payout_summary_";

export function organizerDashboardCacheKey(organizerId: string): string {
  return `${ORG_DASHBOARD_PREFIX}${organizerId}`;
}

export function organizerPayoutSummaryCacheKey(organizerId: string): string {
  return `${ORG_PAYOUT_SUMMARY_PREFIX}${organizerId}`;
}

export function invalidateOrganizerDashboardCache(organizerId: string): void {
  cacheDel(organizerDashboardCacheKey(organizerId));
}

export function invalidateOrganizerPayoutSummaryCache(organizerId: string): void {
  cacheDel(organizerPayoutSummaryCacheKey(organizerId));
}

export function invalidateOrganizerCachesForOrder(organizerId: string): void {
  invalidateOrganizerDashboardCache(organizerId);
  invalidateOrganizerPayoutSummaryCache(organizerId);
}
