import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";

export interface AdminDashboardData {
  metrics: {
    todayRevenue: number;
    monthlyRevenue: number;
    totalRevenue?: number;
    totalUsers?: number;
    totalOrganizers?: number;
    totalEvents: number;
    publishedEvents?: number;
    liveEvents: number;
    activeEvents?: number;
    activeOrganizers: number;
    pendingApprovals: number;
    pendingOrganizers?: number;
    failedPayments: number;
    ticketsSold: number;
    refundRequests: number;
  };
  charts: {
    bookingTrend: { date: string; revenue: number; orders: number; tickets?: number }[];
    userTrend?: { date: string; count: number }[];
    categories: { name: string; value: number }[];
    cities: { name: string; value: number }[];
  };
  widgets: {
    pendingEvents: AdminPendingEvent[];
    pendingOrganizers?: AdminPendingOrganizer[];
    recentActivity: { orderId: string; guestName: string; total: number; paymentStatus: string }[];
    activityFeed?: AdminActivityItem[];
    topEvents: { title: string; slug: string }[];
    topOrganizers: { businessName: string; slug: string }[];
    fraudAlerts: unknown[];
  };
  navCounts?: { pendingEvents: number; pendingOrganizers: number; refundRequests: number };
}

export interface AdminPendingEvent {
  _id: string;
  title: string;
  slug: string;
  city?: string;
  category?: string;
  coverImage?: string;
  startDate?: string;
  organizer?: { businessName?: string; slug?: string };
}

export interface AdminPendingOrganizer {
  _id: string;
  businessName: string;
  slug: string;
  email?: string;
}

export interface AdminActivityItem {
  id: string;
  type: string;
  message: string;
  href?: string;
  at: string;
}

export async function fetchAdminDashboard() {
  const res = await adminApiClient.get<ApiResponse<AdminDashboardData>>("/admin/dashboard");
  return res.data;
}
