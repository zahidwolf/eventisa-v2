import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";
import type {
  AnalyticsDays,
  CategoryBreakdown,
  CityBreakdown,
  PlatformOverview,
  RecentActivity,
  RevenueTimeSeriesPoint,
  StatusBreakdown,
  TicketsTimeSeriesPoint,
  TopEvent,
  TopOrganizer,
  UsersTimeSeriesPoint,
  EventsTimeSeriesPoint,
} from "@/types/adminAnalytics.types";

async function get<T>(path: string) {
  const res = await adminApiClient.get<ApiResponse<T>>(path);
  return res.data;
}

export function getOverview() {
  return get<PlatformOverview>("/admin/analytics/overview");
}

export function getRevenue(days: AnalyticsDays) {
  return get<RevenueTimeSeriesPoint[]>(`/admin/analytics/revenue?days=${days}`);
}

export function getTickets(days: AnalyticsDays) {
  return get<TicketsTimeSeriesPoint[]>(`/admin/analytics/tickets?days=${days}`);
}

export function getUsers(days: AnalyticsDays) {
  return get<UsersTimeSeriesPoint[]>(`/admin/analytics/users?days=${days}`);
}

export function getEvents(days: AnalyticsDays) {
  return get<EventsTimeSeriesPoint[]>(`/admin/analytics/events?days=${days}`);
}

export function getByCategory() {
  return get<CategoryBreakdown[]>("/admin/analytics/by-category");
}

export function getByCity() {
  return get<CityBreakdown[]>("/admin/analytics/by-city");
}

export function getTopEvents(limit = 10) {
  return get<TopEvent[]>(`/admin/analytics/top-events?limit=${limit}`);
}

export function getTopOrganizers(limit = 10) {
  return get<TopOrganizer[]>(`/admin/analytics/top-organizers?limit=${limit}`);
}

export function getOrderStatus() {
  return get<StatusBreakdown[]>("/admin/analytics/order-status");
}

export function getRecent() {
  return get<RecentActivity>("/admin/analytics/recent");
}
