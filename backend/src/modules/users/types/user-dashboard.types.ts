export type TicketListFilter = "all" | "upcoming" | "past" | "cancelled";
export type OrderListFilter = "all" | "paid" | "cancelled" | "refunded";

export interface UserSegmentSummary {
  segmentId: string;
  name: string;
  ticketColor: string;
  price: number;
}

export interface UserEventSummary {
  _id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate?: string;
  bannerImage?: string;
  venue: { name: string; address?: string };
  organizerName?: string;
}

export interface UserTicketOrderRow {
  _id: string;
  orderId: string;
  status: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  quantity: number;
  totalAmount: number;
  promoCode?: string;
  discountAmount: number;
  guestName?: string;
  event: UserEventSummary;
  segment: UserSegmentSummary;
}
