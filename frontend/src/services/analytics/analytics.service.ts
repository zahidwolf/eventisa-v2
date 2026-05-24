import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";

export async function fetchOrganizerAnalytics(eventId?: string) {
  const res = await apiClient.get<ApiResponse<Record<string, unknown>>>("/analytics/organizer", {
    params: eventId ? { eventId } : undefined,
  });
  return res.data;
}

export async function fetchAdminAnalytics() {
  const res = await apiClient.get<ApiResponse<Record<string, unknown>>>("/analytics/admin");
  return res.data;
}
