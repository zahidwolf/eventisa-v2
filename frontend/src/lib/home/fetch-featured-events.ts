import { getApiBaseUrl } from "@/lib/api-base-url";
import type { EventListItem } from "@/types/models/event";

export async function fetchCuratedFeaturedEvents(): Promise<EventListItem[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/public/homepage/featured-events`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { events?: EventListItem[] } };
    return json.data?.events ?? [];
  } catch {
    return [];
  }
}
