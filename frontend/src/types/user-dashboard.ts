export type TicketFilter = "all" | "upcoming" | "past" | "cancelled";
export type OrderFilter = "all" | "paid" | "cancelled" | "refunded";

export interface DashboardStats {
  totalTickets: number;
  totalOrders: number;
  upcomingEvents: number;
  eventsAttended: number;
}

export interface UserSegmentSummary {
  segmentId: string;
  name: string;
  ticketColor: string;
  price: number;
  description?: string;
}

export interface UserEventSummary {
  _id: string;
  title: string;
  slug: string;
  startDate: string;
  endDate?: string;
  coverImage?: string;
  /** @deprecated use coverImage */
  bannerImage?: string;
  venue: { name: string; address?: string; city?: string; mapUrl?: string };
  organizer?: { name?: string };
  /** @deprecated use organizer.name */
  organizerName?: string;
}

export interface UserOrderRow {
  _id: string;
  orderId?: string;
  status: string;
  paymentStatus?: string;
  orderStatus?: string;
  createdAt: string;
  quantity: number;
  totalAmount: number;
  subtotal?: number;
  serviceFee?: number;
  promoCode?: string;
  discountAmount?: number;
  paymentMethod?: string;
  guestName?: string;
  event: UserEventSummary;
  segment: UserSegmentSummary;
}

export interface UserOrderTicket {
  ticketIndex: number;
  qrData: string;
  status: string;
  checkedInAt?: string;
  ticketNumber?: string;
  sectionTitle?: string;
  holderName?: string;
}

export interface UserOrderDetail extends UserOrderRow {
  txRef?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  currency?: string;
  formAnswers: Record<string, unknown>;
  tickets: UserOrderTicket[];
}

/** @deprecated use UserOrderTicket */
export interface UserTicketEntry {
  ticketIndex?: number;
  ticketNumber?: string;
  qrCodeData?: string;
  qrData?: string;
  sectionTitle?: string;
  status: string;
  holderName?: string;
  checkedInAt?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  isEmailVerified: boolean;
  createdAt: string;
  role: string;
}

export interface PaginatedUserOrders {
  data: UserOrderRow[];
  /** @deprecated use data */
  orders?: UserOrderRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** @deprecated use PaginatedUserOrders */
export type PaginatedOrders = PaginatedUserOrders;

export interface ReserveTicketsResponse {
  reservationId: string;
  expiresAt: string;
  eventId: string;
  segmentId: string;
  segmentName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  event: {
    title: string;
    startDate: string;
    coverImage?: string;
    venue: { name: string };
  };
}

export interface CreateOrderResponse {
  orderId: string;
  status: string;
  eventId: string;
  segmentId: string;
  quantity: number;
  totalAmount: number;
  nextStep: "payment";
}

export interface InitializePaymentSlimResponse {
  paymentUrl: string;
  orderId: string;
  amount: number;
  gateway: { provider: string; displayName: string };
  paymentId?: string;
  redirectUrl?: string;
}

export interface VerifyPaymentSlimResponse {
  success: boolean;
  orderId: string;
  status: "paid" | "failed";
  message: string;
}
