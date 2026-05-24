import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { City } from "@/services/admin/cities.service";
import type { Venue } from "@/services/admin/venues.service";

export async function fetchPublicCities() {
  const res = await apiClient.get<ApiResponse<{ cities: City[] }>>("/public/cities");
  return res.data.data?.cities ?? [];
}

export async function fetchPublicVenues(city?: string) {
  const res = await apiClient.get<ApiResponse<{ venues: Venue[] }>>("/public/venues", {
    params: city ? { city } : undefined,
  });
  return res.data.data?.venues ?? [];
}
