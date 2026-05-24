import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { Order, Ticket } from "@/types/models/order";

export async function completeCheckout(data: {
  orderId: string;
  sessionId: string;
  paymentMethod?: string;
  paymentId?: string;
  outcome?: "success" | "failed" | "cancelled";
}) {
  const res = await apiClient.post<
    ApiResponse<{ order: Order; tickets: Ticket[] }>
  >("/checkout/complete", data);
  return res.data;
}
