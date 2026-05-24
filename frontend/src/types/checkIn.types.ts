export type CheckInStatus = "success" | "already_checked_in" | "invalid" | "not_found";

export interface CheckInFormAnswer {
  label: string;
  value: string;
  fieldType: string;
}

export interface CheckInResult {
  status: CheckInStatus;
  attendeeName: string;
  segmentName: string;
  segmentColor?: string;
  ticketId: string;
  scannedAt: string;
  firstScanAt?: string;
  message?: string;
  formAnswers?: CheckInFormAnswer[];
}

export interface CheckInSegmentStat {
  segmentId: string;
  name: string;
  capacity: number;
  checkedIn: number;
  remaining: number;
  color?: string;
}

export interface CheckInStats {
  totalCapacity: number;
  totalCheckedIn: number;
  percentage: number;
  perSegment: CheckInSegmentStat[];
}

export interface OfflineScan {
  qrPayload: string;
  deviceId?: string;
  scannedAt: string;
}

export interface CheckInLogEntry {
  id: string;
  ticketId: string;
  attendeeName: string;
  segmentId: string;
  segmentName: string;
  segmentColor?: string;
  status: CheckInStatus;
  deviceId?: string;
  scannedAt: string;
}

export interface PaginatedCheckInLog {
  rows: CheckInLogEntry[];
  page: number;
  limit: number;
  total: number;
}

export interface SyncResult {
  results: CheckInResult[];
}

export interface CheckInTicketSearchRow {
  ticketNumber: string;
  holderName: string;
  holderEmail: string;
  holderPhone: string;
  segmentName: string;
  segmentColor?: string;
  orderId?: string;
  status: string;
  checkedInAt?: string;
  canCheckIn: boolean;
  alreadyCheckedIn?: boolean;
}
