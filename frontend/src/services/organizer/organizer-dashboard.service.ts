import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";

export interface OrganizerDashboardStats {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  upcomingEvents: number;
  totalCheckedIn: number;
  pendingPayouts: number;
}

export async function fetchOrganizerDashboardStats() {
  const res = await apiClient.get<ApiResponse<OrganizerDashboardStats>>(
    "/organizer/dashboard/stats"
  );
  return res.data.data!;
}
