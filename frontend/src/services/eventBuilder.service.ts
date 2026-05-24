import { apiClient, type ApiResponse } from "@/services/api/client";
import type {
  AttendeeDetailResponse,
  AttendeeFilters,
  AttendeesListResponse,
  ExportFormat,
} from "@/types/attendee.types";
import type { FormField, SegmentStatus, TicketSegment } from "@/types/eventBuilder.types";
import type {
  PromoCode,
  PromoCodeFormData,
  PromoCodeStats,
  ValidateCodeResponse,
} from "@/types/promoCode.types";

const base = (eventId: string) => `/organizer/events/${eventId}`;

export async function getSegments(eventId: string) {
  const res = await apiClient.get<ApiResponse<{ segments: TicketSegment[] }>>(
    `${base(eventId)}/segments`
  );
  return res.data.data!.segments;
}

export async function getPromoCodes(eventId: string) {
  const res = await apiClient.get<ApiResponse<{ promoCodes: PromoCode[] }>>(
    `${base(eventId)}/promo-codes`
  );
  return res.data.data!.promoCodes;
}

export async function createPromoCode(eventId: string, data: PromoCodeFormData) {
  const res = await apiClient.post<ApiResponse<{ promoCode: PromoCode }>>(
    `${base(eventId)}/promo-codes`,
    data
  );
  return res.data.data!.promoCode;
}

export async function updatePromoCode(
  eventId: string,
  codeId: string,
  data: Partial<PromoCodeFormData>
) {
  const res = await apiClient.patch<ApiResponse<{ promoCode: PromoCode }>>(
    `${base(eventId)}/promo-codes/${codeId}`,
    data
  );
  return res.data.data!.promoCode;
}

export async function deletePromoCode(eventId: string, codeId: string) {
  await apiClient.delete(`${base(eventId)}/promo-codes/${codeId}`);
}

export async function getPromoCodeStats(eventId: string, codeId: string) {
  const res = await apiClient.get<ApiResponse<PromoCodeStats>>(
    `${base(eventId)}/promo-codes/${codeId}/stats`
  );
  return res.data.data!;
}

export async function validatePromoCode(
  eventId: string,
  code: string,
  segmentId: string,
  quantity: number,
  guestEmail?: string
) {
  const res = await apiClient.post<ApiResponse<ValidateCodeResponse>>(
    `/events/${eventId}/promo-codes/validate`,
    { code, segmentId, quantity, guestEmail }
  );
  return res.data.data!;
}

export async function createSegment(eventId: string, data: Partial<TicketSegment>) {
  const res = await apiClient.post<ApiResponse<{ segment: TicketSegment }>>(
    `${base(eventId)}/segments`,
    data
  );
  return res.data.data!.segment;
}

export async function updateSegment(
  eventId: string,
  segmentId: string,
  data: Partial<TicketSegment>
) {
  const res = await apiClient.patch<ApiResponse<{ segment: TicketSegment }>>(
    `${base(eventId)}/segments/${segmentId}`,
    data
  );
  return res.data.data!.segment;
}

export async function deleteSegment(eventId: string, segmentId: string) {
  await apiClient.delete(`${base(eventId)}/segments/${segmentId}`);
}

export async function reorderSegments(eventId: string, ids: string[]) {
  const res = await apiClient.patch<ApiResponse<{ segments: TicketSegment[] }>>(
    `${base(eventId)}/segments/reorder`,
    { orderedIds: ids }
  );
  return res.data.data!.segments;
}

export async function forceSegmentStatus(
  eventId: string,
  segmentId: string,
  status: SegmentStatus
) {
  const res = await apiClient.patch<ApiResponse<{ segment: TicketSegment }>>(
    `${base(eventId)}/segments/${segmentId}/status`,
    { status }
  );
  return res.data.data!.segment;
}

export async function addFormField(
  eventId: string,
  segmentId: string | null,
  field: Partial<FormField>
) {
  const path = segmentId
    ? `${base(eventId)}/segments/${segmentId}/form`
    : `${base(eventId)}/form`;
  const res = await apiClient.post<ApiResponse<{ field: FormField }>>(path, field);
  return res.data.data!.field;
}

export async function updateFormField(
  eventId: string,
  segmentId: string | null,
  fieldId: string,
  updates: Partial<FormField>
) {
  const path = segmentId
    ? `${base(eventId)}/segments/${segmentId}/form/${fieldId}`
    : `${base(eventId)}/form/${fieldId}`;
  const res = await apiClient.patch<ApiResponse<{ field: FormField }>>(path, updates);
  return res.data.data!.field;
}

export async function deleteFormField(
  eventId: string,
  segmentId: string | null,
  fieldId: string
) {
  const path = segmentId
    ? `${base(eventId)}/segments/${segmentId}/form/${fieldId}`
    : `${base(eventId)}/form/${fieldId}`;
  await apiClient.delete(path);
}

export async function reorderFormFields(
  eventId: string,
  segmentId: string | null,
  ids: string[]
) {
  const path = segmentId
    ? `${base(eventId)}/segments/${segmentId}/form/reorder`
    : `${base(eventId)}/form/reorder`;
  const res = await apiClient.patch<ApiResponse<{ fields: FormField[] }>>(path, {
    orderedFieldIds: ids,
  });
  return res.data.data!.fields;
}

export async function validateFormSubmission(
  eventId: string,
  segmentId: string | null,
  answers: Record<string, unknown>
) {
  const res = await apiClient.post<ApiResponse<{ valid: boolean }>>(
    `${base(eventId)}/form/validate`,
    { segmentId, answers }
  );
  return res.data.data;
}

export async function getAttendees(eventId: string, filters?: AttendeeFilters) {
  const res = await apiClient.get<ApiResponse<AttendeesListResponse>>(
    `${base(eventId)}/attendees`,
    { params: filters }
  );
  return res.data.data!;
}

export async function getAttendeeById(eventId: string, submissionId: string) {
  const res = await apiClient.get<ApiResponse<AttendeeDetailResponse>>(
    `${base(eventId)}/attendees/submission/${submissionId}`
  );
  return res.data.data!;
}

export async function exportAttendees(
  eventId: string,
  format: ExportFormat,
  segmentId?: string
): Promise<Blob> {
  const res = await apiClient.get(`${base(eventId)}/attendees/export`, {
    params: { format, segmentId },
    responseType: "blob",
  });
  return res.data as Blob;
}
