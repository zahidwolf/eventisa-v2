import mongoose, { Schema, type Document, type Model } from "mongoose";
import {
  OrderReservationStatus,
  OrderStatus,
  PaymentStatus,
  type CustomFormResponse,
  type TicketOrderItem,
} from "@/modules/orders/types/order.types.js";
import { DEFAULT_CURRENCY } from "@/shared/constants/booking.constants.js";

export interface OrderDocument extends Document {
  orderId: string;
  guestEmail: string;
  guestPhone: string;
  guestName: string;
  userId?: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  organizerId: mongoose.Types.ObjectId;
  reservationId: mongoose.Types.ObjectId;
  ticketItems: TicketOrderItem[];
  subtotal: number;
  serviceFee: number;
  discount: number;
  coupon?: string;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  reservationStatus: OrderReservationStatus;
  paymentMethod?: string;
  customFormResponses: CustomFormResponse[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketItemSchema = new Schema<TicketOrderItem>(
  {
    sectionId: { type: String, required: true },
    sectionTitle: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const customFormResponseSchema = new Schema<CustomFormResponse>(
  {
    fieldKey: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    guestEmail: { type: String, required: true, lowercase: true },
    guestPhone: { type: String, required: true },
    guestName: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "Organizer", required: true },
    reservationId: { type: Schema.Types.ObjectId, ref: "TicketReservation", required: true },
    ticketItems: { type: [ticketItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    coupon: String,
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: DEFAULT_CURRENCY },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Pending,
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Draft,
    },
    reservationStatus: {
      type: String,
      enum: Object.values(OrderReservationStatus),
      default: OrderReservationStatus.Reserved,
    },
    paymentMethod: String,
    customFormResponses: { type: [customFormResponseSchema], default: [] },
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

orderSchema.index({ eventId: 1, paymentStatus: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ userId: 1, paymentStatus: 1 });
orderSchema.index({ userId: 1, paymentStatus: 1, createdAt: -1 });
orderSchema.index({ organizerId: 1, paymentStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentMethod: 1 });
orderSchema.index({ utmSource: 1 });

export const Order: Model<OrderDocument> =
  mongoose.models.Order ?? mongoose.model<OrderDocument>("Order", orderSchema);
