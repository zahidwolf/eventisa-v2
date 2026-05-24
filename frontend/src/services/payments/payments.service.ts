import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { PaymentConfig } from "@/types/models/payment";
import type {
  InitializePaymentSlimResponse,
  VerifyPaymentSlimResponse,
} from "@/types/user-dashboard";

export async function fetchPaymentConfig() {
  const res = await apiClient.get<ApiResponse<PaymentConfig>>("/payments/config");
  return res.data;
}

export interface EventGatewayInfo {
  displayName: string;
  logo?: string;
  provider: string;
  isDefault?: boolean;
}

export async function fetchEventGatewayInfo(eventId: string) {
  const res = await apiClient.get<ApiResponse<EventGatewayInfo>>(`/events/${eventId}/gateway-info`);
  return res.data.data!;
}

export async function fetchPaymentConfigForEvent(eventId: string) {
  const res = await apiClient.get<ApiResponse<PaymentConfig & { gateway?: EventGatewayInfo }>>(
    `/payments/config/event/${eventId}`
  );
  return res.data;
}

export async function initializePayment(data: {
  orderId: string;
  sessionId: string;
  method: string;
}) {
  const res = await apiClient.post<ApiResponse<InitializePaymentSlimResponse>>(
    "/payments/initialize",
    data
  );
  return res.data;
}

export async function verifyPayment(data: {
  paymentId: string;
  sessionId: string;
  outcome?: "success" | "failed" | "cancelled";
}) {
  const res = await apiClient.post<ApiResponse<VerifyPaymentSlimResponse>>(
    "/payments/verify",
    data
  );
  return res.data;
}

export async function simulateMockPayment(data: {
  paymentId: string;
  sessionId: string;
  outcome: "success" | "failed" | "cancelled";
}) {
  const res = await apiClient.post<ApiResponse<VerifyPaymentSlimResponse>>(
    "/payments/mock/simulate",
    data
  );
  return res.data;
}
