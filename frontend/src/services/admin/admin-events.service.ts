import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";
import type { EventListItem } from "@/types/models/event";

export interface AdminEventRow extends EventListItem {
  ticketsSold?: number;
  revenue?: number;
  segmentCount?: number;
  capacity?: number;
  status?: string;
  approvalStatus?: string;
}

export async function fetchAdminEvents(params?: {
  search?: string;
  status?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  const res = await adminApiClient.get<
    ApiResponse<{
      events: AdminEventRow[];
      page: number;
      limit: number;
      total: number;
    }>
  >("/admin/events", {
    params,
  });
  return res.data;
}

export async function unpublishEvent(id: string) {
  const res = await adminApiClient.patch(`/admin/events/${id}/unpublish`);
  return res.data;
}

export async function deleteEvent(id: string) {
  const res = await adminApiClient.delete(`/admin/events/${id}`);
  return res.data;
}

export async function fetchPendingEvents() {
  const res = await adminApiClient.get<ApiResponse<{ events: EventListItem[] }>>("/admin/events/pending");
  return res.data;
}

export async function fetchAdminEvent(id: string) {
  const res = await adminApiClient.get<ApiResponse<{ event: EventListItem }>>(`/admin/events/${id}`);
  return res.data;
}

export async function approveEvent(id: string) {
  const res = await adminApiClient.patch<ApiResponse<{ event: EventListItem }>>(
    `/admin/events/${id}/approve`
  );
  return res.data;
}

export async function rejectEvent(id: string, reason?: string) {
  const res = await adminApiClient.patch<ApiResponse<{ event: EventListItem }>>(
    `/admin/events/${id}/reject`,
    { reason }
  );
  return res.data;
}

export async function requestEventChanges(id: string, message: string) {
  const res = await adminApiClient.patch<ApiResponse<{ event: EventListItem }>>(
    `/admin/events/${id}/request-changes`,
    { message }
  );
  return res.data;
}

export async function updateEventModeration(
  id: string,
  data: { featured?: boolean; trending?: boolean; homepagePriority?: number; listingRank?: number }
) {
  const res = await adminApiClient.patch<ApiResponse<{ event: EventListItem }>>(
    `/admin/events/${id}/moderation`,
    data
  );
  return res.data;
}

export async function updateAdminEvent(id: string, data: Record<string, unknown>) {
  const res = await adminApiClient.put<ApiResponse<{ event: EventListItem }>>(
    `/admin/events/${id}`,
    data
  );
  return res.data;
}
