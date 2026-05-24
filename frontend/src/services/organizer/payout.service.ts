import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { PayoutListItem, PayoutRecord, PayoutSummary, PayoutableEvent } from "@/types/payout.types";

export async function getPayoutSummary() {
  const res = await apiClient.get<ApiResponse<PayoutSummary>>("/organizer/payouts/summary");
  return res.data.data!;
}

export async function getPayoutableEvents() {
  const res = await apiClient.get<ApiResponse<PayoutableEvent[]>>("/organizer/payouts/payoutable-events");
  return res.data.data ?? [];
}

export async function createPayoutRequest(eventIds: string[], requestNote?: string) {
  const res = await apiClient.post<ApiResponse<PayoutRecord>>("/organizer/payouts", {
    eventIds,
    requestNote,
  });
  return res.data.data!;
}

export async function getPayouts(params?: { status?: string; page?: number; limit?: number }) {
  const res = await apiClient.get<
    ApiResponse<{ items: PayoutListItem[]; total: number; page: number; limit: number; pages: number }>
  >("/organizer/payouts", { params });
  return res.data.data!;
}

export async function getPayoutDetail(payoutId: string) {
  const res = await apiClient.get<ApiResponse<PayoutRecord>>(`/organizer/payouts/${payoutId}`);
  return res.data.data!;
}
