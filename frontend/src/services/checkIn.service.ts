import { apiClient, type ApiResponse } from "@/services/api/client";
import { adminApiClient } from "@/services/api/admin-client";

export type CheckInApiScope = "organizer" | "admin";
import type {
  CheckInResult,
  CheckInStats,
  CheckInTicketSearchRow,
  OfflineScan,
  PaginatedCheckInLog,
  SyncResult,
} from "@/types/checkIn.types";

const base = (eventId: string, scope: CheckInApiScope = "organizer") =>
  scope === "admin" ? `/admin/events/${eventId}/checkin` : `/organizer/events/${eventId}/checkin`;

function client(scope: CheckInApiScope) {
  return scope === "admin" ? adminApiClient : apiClient;
}

export async function searchTicketsForCheckIn(
  eventId: string,
  query: string,
  scope: CheckInApiScope = "organizer"
): Promise<CheckInTicketSearchRow[]> {
  const res = await client(scope).get<ApiResponse<{ tickets: CheckInTicketSearchRow[] }>>(
    `${base(eventId, scope)}/search`,
    { params: { q: query } }
  );
  return res.data.data!.tickets;
}

export async function manualCheckIn(
  eventId: string,
  ticketNumber: string,
  scope: CheckInApiScope = "organizer"
): Promise<CheckInResult> {
  const res = await client(scope).post<ApiResponse<{ result: CheckInResult }>>(
    `${base(eventId, scope)}/manual`,
    { ticketNumber }
  );
  return res.data.data!.result;
}

export async function scanTicket(
  eventId: string,
  qrPayload: string,
  deviceId?: string,
  scope: CheckInApiScope = "organizer"
): Promise<CheckInResult> {
  const res = await client(scope).post<ApiResponse<{ result: CheckInResult }>>(`${base(eventId, scope)}/scan`, {
    qrPayload,
    deviceId,
  });
  return res.data.data!.result;
}

export async function bulkSyncScans(
  eventId: string,
  scans: OfflineScan[],
  scope: CheckInApiScope = "organizer"
): Promise<SyncResult> {
  const res = await client(scope).post<ApiResponse<SyncResult>>(`${base(eventId, scope)}/sync`, { scans });
  return res.data.data!;
}

export async function getCheckInStats(
  eventId: string,
  scope: CheckInApiScope = "organizer"
): Promise<CheckInStats> {
  const res = await client(scope).get<ApiResponse<CheckInStats>>(`${base(eventId, scope)}/stats`);
  return res.data.data!;
}

export async function getCheckInLog(
  eventId: string,
  filters?: {
    page?: number;
    limit?: number;
    segmentId?: string;
    status?: string;
  },
  scope: CheckInApiScope = "organizer"
): Promise<PaginatedCheckInLog> {
  const res = await client(scope).get<ApiResponse<PaginatedCheckInLog>>(`${base(eventId, scope)}/log`, {
    params: filters,
  });
  return res.data.data!;
}
