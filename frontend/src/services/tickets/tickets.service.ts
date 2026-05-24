import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { Ticket } from "@/types/models/order";

export async function getTicket(id: string) {
  const res = await apiClient.get<ApiResponse<{ ticket: Ticket }>>(`/tickets/${id}`);
  return res.data;
}

export async function getTicketsByOrder(orderId: string) {
  const res = await apiClient.get<ApiResponse<{ tickets: Ticket[] }>>("/tickets/order", {
    params: { orderId },
  });
  return res.data;
}
