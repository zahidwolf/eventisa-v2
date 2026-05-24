import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { CustomFormResponse } from "@/types/models/order";
import type {
  CreateOrderResponse,
  PaginatedUserOrders,
  ReserveTicketsResponse,
} from "@/types/user-dashboard";

export async function reserveTickets(data: {
  eventId: string;
  sectionId: string;
  quantity: number;
  sessionId: string;
}) {
  const res = await apiClient.post<ApiResponse<ReserveTicketsResponse>>("/orders/reserve", data);
  return res.data;
}

export async function createOrder(data: {
  reservationId: string;
  sessionId: string;
  guest: { name: string; email: string; phone: string; studentId?: string };
  customFormResponses: CustomFormResponse[];
  coupon?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  const res = await apiClient.post<ApiResponse<CreateOrderResponse>>("/orders/create", data);
  return res.data;
}

export async function confirmFreeOrder(orderId: string, sessionId: string) {
  const res = await apiClient.post<
    ApiResponse<{ orderId: string; status: string; ticketCount: number }>
  >(`/orders/${orderId}/confirm-free`, { sessionId });
  return res.data;
}

export async function getOrder(id: string, sessionId?: string) {
  const res = await apiClient.get<
    ApiResponse<{
      orderId: string;
      status: string;
      eventId: string;
      segmentId?: string;
      quantity: number;
      totalAmount: number;
    }>
  >(`/orders/${id}`, {
    params: sessionId ? { sessionId } : undefined,
  });
  return res.data;
}

export async function cancelOrder(id: string, sessionId: string) {
  const res = await apiClient.post<ApiResponse<{ orderId: string; status: string }>>(
    `/orders/${id}/cancel`,
    { sessionId }
  );
  return res.data;
}

export type { PaginatedUserOrders };
