import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";

export type GatewayProvider = "sslcommerz" | "bkash" | "nagad";

export interface PaymentGateway {
  _id: string;
  name: string;
  provider: GatewayProvider;
  displayName: string;
  logo?: string;
  isActive: boolean;
  isDefault: boolean;
  credentials?: Record<string, unknown>;
  createdAt: string;
}

export interface EventGatewayAssignment {
  assigned: {
    id: string;
    name: string;
    displayName: string;
    provider: GatewayProvider;
    isDefault: boolean;
  } | null;
  effective: {
    displayName: string;
    provider: GatewayProvider;
    isDefault: boolean;
  } | null;
  assignedBy?: { name?: string; email?: string };
  assignedAt?: string;
  usesPlatformDefault: boolean;
}

export interface GatewayPublicInfo {
  displayName: string;
  logo?: string;
  provider: GatewayProvider;
  isDefault: boolean;
}

export async function fetchPaymentGatewayById(id: string) {
  const res = await adminApiClient.get<ApiResponse<{ gateway: PaymentGateway }>>(
    `/admin/payment-gateways/${id}`
  );
  return res.data.data!.gateway;
}

export async function fetchPaymentGateways() {
  const res = await adminApiClient.get<ApiResponse<{ gateways: PaymentGateway[] }>>(
    "/admin/payment-gateways"
  );
  return res.data.data!.gateways;
}

export async function createPaymentGateway(data: Record<string, unknown>) {
  const res = await adminApiClient.post<ApiResponse<{ gateway: PaymentGateway }>>(
    "/admin/payment-gateways",
    data
  );
  return res.data.data!.gateway;
}

export async function updatePaymentGateway(id: string, data: Record<string, unknown>) {
  const res = await adminApiClient.patch<ApiResponse<{ gateway: PaymentGateway }>>(
    `/admin/payment-gateways/${id}`,
    data
  );
  return res.data.data!.gateway;
}

export async function deletePaymentGateway(id: string) {
  await adminApiClient.delete(`/admin/payment-gateways/${id}`);
}

export async function setDefaultPaymentGateway(id: string) {
  const res = await adminApiClient.patch<ApiResponse<{ gateway: PaymentGateway }>>(
    `/admin/payment-gateways/${id}/set-default`
  );
  return res.data.data!.gateway;
}

export async function fetchEventGatewayAssignment(eventId: string) {
  const res = await adminApiClient.get<ApiResponse<EventGatewayAssignment>>(
    `/admin/events/${eventId}/gateway-assignment`
  );
  return res.data.data!;
}

export async function assignEventGateway(eventId: string, gatewayId: string) {
  const res = await adminApiClient.patch<ApiResponse<unknown>>(
    `/admin/events/${eventId}/assign-gateway`,
    { gatewayId }
  );
  return res.data;
}

export async function removeEventGateway(eventId: string) {
  const res = await adminApiClient.patch<ApiResponse<unknown>>(
    `/admin/events/${eventId}/remove-gateway`
  );
  return res.data;
}

