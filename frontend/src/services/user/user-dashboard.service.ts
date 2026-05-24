import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type {
  DashboardStats,
  OrderFilter,
  PaginatedUserOrders,
  TicketFilter,
  UserOrderDetail,
  UserProfile,
} from "@/types/user-dashboard";

export async function fetchDashboardStats() {
  const res = await apiClient.get<ApiResponse<DashboardStats>>("/user/dashboard/stats");
  return res.data.data!;
}

export async function fetchUserTickets(params: {
  status?: TicketFilter;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const res = await apiClient.get<ApiResponse<PaginatedUserOrders>>("/user/tickets", { params });
  const payload = res.data.data!;
  return {
    ...payload,
    orders: payload.data ?? payload.orders ?? [],
  };
}

export async function fetchUserOrders(params: {
  status?: OrderFilter;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const res = await apiClient.get<ApiResponse<PaginatedUserOrders>>("/user/orders", { params });
  const payload = res.data.data!;
  return {
    ...payload,
    orders: payload.data ?? payload.orders ?? [],
  };
}

export async function fetchUserOrderDetail(orderId: string) {
  const res = await apiClient.get<ApiResponse<{ order: UserOrderDetail }>>(
    `/user/orders/${orderId}`
  );
  const order = res.data.data!.order;
  return {
    ...order,
    paymentStatus: order.paymentStatus ?? order.status,
    orderStatus: order.orderStatus ?? "",
    event: {
      ...order.event,
      bannerImage: order.event.bannerImage ?? order.event.coverImage,
      organizerName: order.event.organizerName ?? order.event.organizer?.name,
    },
  };
}

export async function fetchUserProfile() {
  const res = await apiClient.get<ApiResponse<{ profile: UserProfile }>>("/user/profile");
  return res.data.data!.profile;
}

export async function patchUserProfile(body: Partial<UserProfile>) {
  const res = await apiClient.patch<ApiResponse<{ profile: UserProfile }>>("/user/profile", body);
  return res.data.data!.profile;
}

export async function changeUserPassword(body: { currentPassword: string; newPassword: string }) {
  await apiClient.post("/user/change-password", body);
}

export async function deleteUserAccount() {
  await apiClient.post("/user/delete-account", { confirmation: "DELETE" });
}
