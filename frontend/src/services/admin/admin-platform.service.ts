import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";

export interface AdminNavCounts {
  pendingEvents: number;
  pendingOrganizers: number;
  pendingRefunds: number;
  pendingPayouts: number;
  /** @deprecated use pendingRefunds */
  refundRequests?: number;
}

export async function fetchAdminNavCounts() {
  const res = await adminApiClient.get<ApiResponse<AdminNavCounts>>("/admin/nav-counts");
  return res.data;
}

export async function fetchAdminUsers(params?: { search?: string; page?: number }) {
  const res = await adminApiClient.get<ApiResponse<{ users: Record<string, unknown>[]; total: number }>>(
    "/admin/users",
    { params }
  );
  return res.data;
}

export async function fetchAdminOrganizers(params?: {
  status?: string;
  search?: string;
  page?: number;
}) {
  const res = await adminApiClient.get<
    ApiResponse<{ organizers: Record<string, unknown>[]; total: number }>
  >("/admin/organizers", { params });
  return res.data;
}

export async function approveOrganizerAdmin(id: string) {
  const res = await adminApiClient.patch(`/admin/organizers/${id}/approve`);
  return res.data;
}

export async function rejectOrganizerAdmin(id: string) {
  const res = await adminApiClient.patch(`/admin/organizers/${id}/reject`);
  return res.data;
}

export async function fetchAdminOrders(params?: { search?: string; status?: string; page?: number }) {
  const res = await adminApiClient.get<ApiResponse<{ orders: Record<string, unknown>[]; total: number }>>(
    "/admin/orders",
    { params }
  );
  return res.data;
}
