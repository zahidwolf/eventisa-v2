export interface CustomFormResponse {
  fieldKey: string;
  value: string | string[] | boolean | number;
}

export interface TicketOrderItem {
  sectionId: string;
  sectionTitle: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  _id: string;
  orderId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  eventId: { _id: string; title: string; slug: string; coverImage?: string; startDate: string; venue?: { name: string; city: string } };
  ticketItems: TicketOrderItem[];
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
  currency: string;
  paymentStatus: string;
  orderStatus: string;
  expiresAt: string;
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  bookingId: string;
  sectionTitle: string;
  holderName: string;
  holderEmail: string;
  qrCodeData: string;
  eventId: { title: string; slug: string; startDate: string; venue?: { name: string; city: string }; coverImage?: string };
}
