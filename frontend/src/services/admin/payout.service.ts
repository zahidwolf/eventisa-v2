import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";
import type { AdminPayoutDetail, AdminPayoutStats, PayoutRecord } from "@/types/payout.types";

export async function getAdminPayoutStats() {
  const res = await adminApiClient.get<ApiResponse<AdminPayoutStats>>("/admin/finance/payouts/stats");
  return res.data.data!;
}

export async function getAdminPayouts(params?: Record<string, string | number | undefined>) {
  const res = await adminApiClient.get<
    ApiResponse<{ items: PayoutRecord[]; total: number; page: number; limit: number; pages: number }>
  >("/admin/finance/payouts", { params });
  return res.data.data!;
}

export async function getAdminPayoutDetail(payoutId: string) {
  const res = await adminApiClient.get<ApiResponse<AdminPayoutDetail>>(`/admin/finance/payouts/${payoutId}`);
  return res.data.data!;
}

export async function approvePayoutRequest(payoutId: string) {
  const res = await adminApiClient.patch<ApiResponse<PayoutRecord>>(`/admin/finance/payouts/${payoutId}/approve`);
  return res.data.data!;
}

export async function rejectPayoutRequest(payoutId: string, reason: string) {
  const res = await adminApiClient.patch<ApiResponse<PayoutRecord>>(`/admin/finance/payouts/${payoutId}/reject`, {
    reason,
  });
  return res.data.data!;
}

export async function markPayoutAsPaid(
  payoutId: string,
  body: { txRef: string; paymentMethod: string; paymentNote?: string }
) {
  const res = await adminApiClient.patch<ApiResponse<PayoutRecord>>(`/admin/finance/payouts/${payoutId}/paid`, body);
  return res.data.data!;
}
