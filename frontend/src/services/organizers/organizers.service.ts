import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { OrganizerPublicProfile } from "@/types/models/organizer";
import type { OrganizerShowcaseItem } from "@/types/models/organizer-showcase";

export async function fetchOrganizerBySlug(slug: string) {
  const res = await apiClient.get<ApiResponse<OrganizerPublicProfile>>(`/organizers/slug/${slug}`);
  return res.data;
}

export async function fetchOrganizerShowcase() {
  const res = await apiClient.get<ApiResponse<{ organizers: OrganizerShowcaseItem[] }>>(
    "/public/organizers/showcase"
  );
  return res.data.data.organizers;
}
