import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";

export interface Venue {
  _id: string;
  name: string;
  address?: string;
  city: string;
  capacity?: number;
  image?: string;
  googleMapsUrl?: string;
  isActive: boolean;
}

export type VenueInput = {
  name: string;
  address?: string;
  city: string;
  capacity?: number;
  image?: string;
  googleMapsUrl?: string;
  isActive?: boolean;
};

export async function fetchAdminVenues() {
  const res = await adminApiClient.get<ApiResponse<{ venues: Venue[] }>>("/admin/venues");
  return res.data.data!.venues;
}

export async function createVenue(input: VenueInput) {
  const res = await adminApiClient.post<ApiResponse<{ venue: Venue }>>("/admin/venues", input);
  return res.data.data!.venue;
}

export async function updateVenue(id: string, input: Partial<VenueInput>) {
  const res = await adminApiClient.patch<ApiResponse<{ venue: Venue }>>(
    `/admin/venues/${id}`,
    input
  );
  return res.data.data!.venue;
}

export async function deleteVenue(id: string) {
  await adminApiClient.delete(`/admin/venues/${id}`);
}
