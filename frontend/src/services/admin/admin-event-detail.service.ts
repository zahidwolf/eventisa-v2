import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";
import type {
  AttendeeDetailResponse,
  AttendeeFilters,
  AttendeesListResponse,
} from "@/types/attendee.types";
import type { EventAnalyticsData } from "@/types/organizer-event-management";
import type {
  PromoCode,
  PromoCodeFormData,
  PromoCodeStats,
  SegmentOption,
} from "@/types/promoCode.types";

const base = (eventId: string) => `/admin/events/${eventId}`;

export interface AdminEventHeader {
  _id: string;
  title: string;
  slug: string;
  status: string;
  approvalStatus: string;
  startDate: string;
  venue: { name: string; city: string };
  organizer: { id?: string; name: string; email?: string };
}

export interface AdminEventOverviewData {
  stats: {
    totalBookings: number;
    totalCapacity: number;
    grossRevenue: number;
    platformFee: number;
    netOrganizer: number;
    checkInRate: number;
    activePromoCodes: number;
    ticketsSold: number;
  };
  event: Record<string, unknown>;
  segments: Array<{
    segmentId: string;
    name: string;
    price: number;
    isFree: boolean;
    capacity: number;
    sold: number;
    remaining: number;
    revenue: number;
    checkInCount: number;
    status: string;
    visibility: string;
  }>;
  segmentTotals: {
    capacity: number;
    sold: number;
    remaining: number;
    revenue: number;
    checkInCount: number;
  };
}

export interface AdminBookingRow {
  id: string;
  orderId: string;
  orderIdShort: string;
  buyerName: string;
  buyerEmail: string;
  segmentName: string;
  segmentId?: string;
  quantity: number;
  amount: number;
  promoCode?: string;
  discount: number;
  paymentStatus: string;
  bookedAt: string;
}

export interface AdminBookingDetail {
  order: Record<string, unknown>;
  buyer: { name: string; email: string; phone: string };
  event: { title: string; startDate: string; venue: { name: string } };
  segment: { name?: string; price?: number; quantity: number };
  formAnswers: Record<string, unknown>;
  tickets: Array<{
    ticketNumber: string;
    qrCodeData: string;
    status: string;
    checkInAt?: string;
  }>;
}

export async function fetchAdminEventHeader(eventId: string) {
  const res = await adminApiClient.get<ApiResponse<{ event: AdminEventHeader }>>(
    `${base(eventId)}/header`
  );
  return res.data.data!.event;
}

export async function fetchAdminEventOverview(eventId: string) {
  const res = await adminApiClient.get<ApiResponse<AdminEventOverviewData>>(
    `${base(eventId)}/overview`
  );
  return res.data.data!;
}

export async function fetchAdminEventAnalytics(eventId: string) {
  const res = await adminApiClient.get<
    ApiResponse<EventAnalyticsData & { platformFeeEarned: number }>
  >(`${base(eventId)}/analytics`);
  return res.data.data!;
}

export async function fetchAdminEventBookings(
  eventId: string,
  params?: Record<string, string | number | undefined>
) {
  const res = await adminApiClient.get<
    ApiResponse<{
      rows: AdminBookingRow[];
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }>
  >(`${base(eventId)}/bookings`, { params });
  return res.data.data!;
}

export async function fetchAdminBookingDetail(eventId: string, orderId: string) {
  const res = await adminApiClient.get<ApiResponse<AdminBookingDetail>>(
    `${base(eventId)}/bookings/${orderId}`
  );
  return res.data.data!;
}

export async function exportAdminBookings(
  eventId: string,
  format: "csv" | "excel",
  params?: Record<string, string | undefined>
) {
  const res = await adminApiClient.get(`${base(eventId)}/bookings/export`, {
    params: { ...params, format },
    responseType: "blob",
  });
  return res.data as Blob;
}

export async function adminRefundBooking(eventId: string, orderId: string, reason?: string) {
  const res = await adminApiClient.post(`${base(eventId)}/bookings/${orderId}/refund`, { reason });
  return res.data;
}

export async function adminCancelBooking(eventId: string, orderId: string, reason?: string) {
  const res = await adminApiClient.post(`${base(eventId)}/bookings/${orderId}/cancel`, { reason });
  return res.data;
}

export async function adminResendBookingEmail(eventId: string, orderId: string) {
  const res = await adminApiClient.post(`${base(eventId)}/bookings/${orderId}/resend-email`);
  return res.data;
}

export async function adminUpdateSegment(
  eventId: string,
  segmentId: string,
  data: { status?: string; capacity?: number; isVisible?: boolean; visibility?: string }
) {
  const res = await adminApiClient.patch(`${base(eventId)}/segments/${segmentId}/admin-update`, data);
  return res.data;
}

export async function fetchAdminAttendees(eventId: string, filters?: AttendeeFilters) {
  const res = await adminApiClient.get<ApiResponse<AttendeesListResponse>>(
    `${base(eventId)}/attendees`,
    { params: filters }
  );
  return res.data.data!;
}

export async function fetchAdminAttendeeById(eventId: string, submissionId: string) {
  const res = await adminApiClient.get<ApiResponse<AttendeeDetailResponse>>(
    `${base(eventId)}/attendees/submission/${submissionId}`
  );
  return res.data.data!;
}

export async function getAdminPromoCodes(eventId: string) {
  const res = await adminApiClient.get<ApiResponse<{ promoCodes: PromoCode[] }>>(
    `${base(eventId)}/promo-codes`
  );
  return res.data.data!.promoCodes;
}

export async function createAdminPromoCode(eventId: string, data: PromoCodeFormData) {
  const res = await adminApiClient.post<ApiResponse<{ promoCode: PromoCode }>>(
    `${base(eventId)}/promo-codes`,
    data
  );
  return res.data.data!.promoCode;
}

export async function updateAdminPromoCode(
  eventId: string,
  codeId: string,
  data: Partial<PromoCodeFormData>
) {
  const res = await adminApiClient.patch<ApiResponse<{ promoCode: PromoCode }>>(
    `${base(eventId)}/promo-codes/${codeId}`,
    data
  );
  return res.data.data!.promoCode;
}

export async function deleteAdminPromoCode(eventId: string, codeId: string) {
  await adminApiClient.delete(`${base(eventId)}/promo-codes/${codeId}`);
}

export async function getAdminPromoCodeStats(eventId: string, codeId: string) {
  const res = await adminApiClient.get<ApiResponse<PromoCodeStats>>(
    `${base(eventId)}/promo-codes/${codeId}/stats`
  );
  return res.data.data!;
}

export function adminSegmentOptionsFromOverview(
  overview: AdminEventOverviewData
): SegmentOption[] {
  return overview.segments.map((s) => ({ segmentId: s.segmentId, name: s.name }));
}
