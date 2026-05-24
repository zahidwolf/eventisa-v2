import mongoose, { Schema, type Document, type Model } from "mongoose";
import { ReservationState } from "@/modules/tickets/types/reservation.types.js";

export interface TicketReservationDocument extends Document {
  eventId: mongoose.Types.ObjectId;
  sectionId: mongoose.Types.ObjectId;
  quantity: number;
  status: ReservationState;
  orderId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketReservationSchema = new Schema<TicketReservationDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: Object.values(ReservationState),
      default: ReservationState.Reserved,
      index: true,
    },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

ticketReservationSchema.index({ eventId: 1, sectionId: 1, status: 1 });
ticketReservationSchema.index({ userId: 1, status: 1 });

export const TicketReservation: Model<TicketReservationDocument> =
  mongoose.models.TicketReservation ??
  mongoose.model<TicketReservationDocument>("TicketReservation", ticketReservationSchema);
