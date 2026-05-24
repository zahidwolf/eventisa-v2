export enum PaymentStatus {
  Pending = "pending",
  Paid = "paid",
  Failed = "failed",
  Refunded = "refunded",
}

export enum OrderStatus {
  Draft = "draft",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
  Completed = "completed",
}

export enum OrderReservationStatus {
  Reserved = "reserved",
  Expired = "expired",
  Released = "released",
}

export interface TicketOrderItem {
  sectionId: string;
  sectionTitle: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface GuestInfo {
  name: string;
  email: string;
  phone: string;
}

export interface CustomFormResponse {
  fieldKey: string;
  value: string | string[] | boolean;
}
