export type ExportFormat = "csv" | "excel";

export interface AttendeeSubmission {
  id: string;
  orderId: string;
  segmentId: string;
  segmentName: string;
  segmentColor?: string;
  name: string;
  email: string;
  phone?: string;
  answers: Record<string, string | number | boolean | string[]>;
  submittedAt: string;
}

export interface AttendeeFilters {
  page?: number;
  limit?: number;
  search?: string;
  segmentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SegmentAttendeeCount {
  segmentId: string;
  name: string;
  color?: string;
  count: number;
}

export interface AttendeeFormFieldLabel {
  key: string;
  label: string;
}

export interface AttendeesListResponse {
  rows: AttendeeSubmission[];
  page: number;
  limit: number;
  total: number;
  segmentCounts: SegmentAttendeeCount[];
  formFields?: AttendeeFormFieldLabel[];
}

export interface AttendeeDetailResponse {
  submission: AttendeeSubmission;
  segment: { name: string; color?: string };
  formFields?: AttendeeFormFieldLabel[];
  ticket: {
    ticketNumber: string;
    qrCodeData: string;
    status: string;
  } | null;
}
