import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";
import type { EventListItem } from "@/types/models/event";

export interface FeaturedCuration {
  featuredEventIds: string[];
  events: EventListItem[];
}

export async function fetchFeaturedCuration() {
  const res = await adminApiClient.get<ApiResponse<FeaturedCuration>>(
    "/admin/homepage-control/featured-events"
  );
  return res.data.data!;
}

export async function saveFeaturedCuration(featuredEventIds: string[]) {
  const res = await adminApiClient.put<ApiResponse<FeaturedCuration>>(
    "/admin/homepage-control/featured-events",
    { featuredEventIds }
  );
  return res.data.data!;
}

export interface TrendingCuration {
  trendingEventIds: string[];
  events: EventListItem[];
}

export async function fetchTrendingCuration() {
  const res = await adminApiClient.get<ApiResponse<TrendingCuration>>(
    "/admin/homepage-control/trending-events"
  );
  return res.data.data!;
}

export async function saveTrendingCuration(trendingEventIds: string[]) {
  const res = await adminApiClient.put<ApiResponse<TrendingCuration>>(
    "/admin/homepage-control/trending-events",
    { trendingEventIds }
  );
  return res.data.data!;
}
