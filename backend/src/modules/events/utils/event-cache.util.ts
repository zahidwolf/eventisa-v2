import { cacheDel, cacheDelByPrefix } from "@/shared/cache/cache.service.js";

export const EVENT_LIST_CACHE_PREFIX = "events_list_";
export const EVENT_DETAIL_CACHE_PREFIX = "event_detail_";
export const FEATURED_EVENTS_CACHE_KEY = "featured_events";
export const ORGANIZER_SHOWCASE_CACHE_KEY = "organizer_showcase";
export const TEAM_MEMBERS_CACHE_KEY = "team_members";
export const PLATFORM_STATUS_CACHE_KEY = "platform_status";

export function invalidateEventListCache(): void {
  cacheDelByPrefix(EVENT_LIST_CACHE_PREFIX);
}

export function invalidateEventDetailCache(slug?: string): void {
  if (slug) {
    cacheDel(`${EVENT_DETAIL_CACHE_PREFIX}${slug.toLowerCase()}`);
  } else {
    cacheDelByPrefix(EVENT_DETAIL_CACHE_PREFIX);
  }
}

export function invalidateFeaturedEventsCache(): void {
  cacheDel(FEATURED_EVENTS_CACHE_KEY);
}

export function invalidateOrganizerShowcaseCache(): void {
  cacheDel(ORGANIZER_SHOWCASE_CACHE_KEY);
}

export function invalidateTeamMembersCache(): void {
  cacheDel(TEAM_MEMBERS_CACHE_KEY);
}

export function invalidatePlatformStatusCache(): void {
  cacheDel(PLATFORM_STATUS_CACHE_KEY);
}

/** Call when any public event listing or detail may have changed. */
export function invalidatePublicEventCaches(slug?: string): void {
  invalidateEventListCache();
  invalidateEventDetailCache(slug);
  invalidateFeaturedEventsCache();
}
