import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";

export async function scanCheckIn(qrData: string, eventId?: string) {
  const res = await apiClient.post<ApiResponse<unknown>>("/organizer/checkin/scan", {
    qrData,
    eventId,
  });
  return res.data;
}

export async function manualCheckIn(ticketNumber: string, eventId: string) {
  const res = await apiClient.post<ApiResponse<unknown>>("/organizer/checkin/manual", {
    ticketNumber,
    eventId,
  });
  return res.data;
}

export async function fetchCheckInStats(eventId: string) {
  const res = await apiClient.get<ApiResponse<{
    total: number;
    checkedIn: number;
    unused: number;
    cancelled: number;
    attendanceRate: number;
  }>>("/organizer/checkin/stats", { params: { eventId } });
  return res.data;
}
