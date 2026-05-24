import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { EventDetail } from "@/types/models/event";
import type {
  EventAnalyticsData,
  EventOverviewData,
  OrganizerEventsFilters,
  OrganizerEventsListResponse,
} from "@/types/organizer-event-management";

export async function fetchOrganizerEvents(filters?: OrganizerEventsFilters) {
  const res = await apiClient.get<ApiResponse<OrganizerEventsListResponse>>("/organizer/events", {
    params: filters,
  });
  return res.data;
}

export async function fetchEventOverview(eventId: string) {
  const res = await apiClient.get<ApiResponse<EventOverviewData>>(
    `/organizer/events/${eventId}/overview`
  );
  return res.data.data!;
}

export async function fetchEventAnalytics(eventId: string) {
  const res = await apiClient.get<ApiResponse<EventAnalyticsData>>(
    `/organizer/events/${eventId}/analytics`
  );
  return res.data.data!;
}

export async function publishOrganizerEvent(eventId: string) {
  const res = await apiClient.post<ApiResponse<{ event: EventDetail }>>(
    `/organizer/events/${eventId}/publish`
  );
  return res.data;
}

export async function unpublishOrganizerEvent(eventId: string) {
  const res = await apiClient.post<ApiResponse<{ event: EventDetail }>>(
    `/organizer/events/${eventId}/unpublish`
  );
  return res.data;
}

export async function fetchOrganizerEvent(id: string) {
  const res = await apiClient.get<ApiResponse<{ event: EventDetail }>>(`/organizer/events/${id}`);
  return res.data;
}

export async function createOrganizerEvent(data: Record<string, unknown>) {
  const res = await apiClient.post<ApiResponse<{ event: EventDetail }>>("/organizer/events", data);
  return res.data;
}

export async function updateOrganizerEvent(id: string, data: Record<string, unknown>) {
  const res = await apiClient.put<ApiResponse<{ event: EventDetail }>>(`/organizer/events/${id}`, data);
  return res.data;
}

export async function deleteOrganizerEvent(id: string) {
  const res = await apiClient.delete(`/organizer/events/${id}`);
  return res.data;
}

export async function duplicateOrganizerEvent(id: string) {
  const res = await apiClient.post<ApiResponse<{ event: EventDetail }>>(
    `/organizer/events/${id}/duplicate`
  );
  return res.data;
}

export async function submitEventForReview(id: string) {
  const res = await apiClient.post<ApiResponse<{ event: EventDetail }>>(
    `/organizer/events/${id}/submit-for-review`
  );
  return res.data;
}
