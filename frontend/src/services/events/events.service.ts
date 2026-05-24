import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { EventListItem, EventDetail } from "@/types/models/event";

interface EventsListParams {
  category?: string;
  city?: string;
  page?: number;
  limit?: number;
}

interface EventsListData {
  events: EventListItem[];
  pagination: { total: number; page: number; limit: number };
}

export async function fetchEvents(params?: EventsListParams) {
  const res = await apiClient.get<ApiResponse<EventsListData>>("/events", { params });
  return res.data;
}

export async function fetchEventBySlug(slug: string) {
  const res = await apiClient.get<ApiResponse<{ event: EventDetail }>>(`/events/slug/${slug}`);
  return res.data;
}

export async function fetchCategories() {
  const res = await apiClient.get<ApiResponse<{ categories: string[] }>>("/events/categories");
  return res.data;
}
