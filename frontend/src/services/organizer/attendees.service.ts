import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";

export interface AttendeeRow {
  orderId: string;
  name: string;
  email: string;
  phone: string;
  section: string;
  quantity: number;
  responses: { fieldKey: string; value: string | string[] | boolean }[];
  createdAt: string;
}

export async function listAttendees(eventId: string, search?: string) {
  const res = await apiClient.get<ApiResponse<{ attendees: AttendeeRow[] }>>(
    `/organizer/events/${eventId}/attendees`,
    { params: search ? { search } : undefined }
  );
  return res.data;
}

export function attendeesExportUrl(eventId: string) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "/api";
  return `${base}/organizer/events/${eventId}/attendees/export`;
}
