import mongoose, { Schema, type Document, type Model } from "mongoose";
import { TicketStatus } from "@/modules/tickets/types/ticket.types.js";

export interface TicketDocument extends Document {
  ticketNumber: string;
  bookingId: string;
  orderId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  sectionId: string;
  sectionTitle: string;
  holderName: string;
  holderEmail: string;
  holderPhone: string;
  qrCodeData: string;
  status: TicketStatus;
  userId?: mongoose.Types.ObjectId;
  checkedInAt?: Date;
  checkedInBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<TicketDocument>(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    bookingId: { type: String, required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    sectionId: { type: String, required: true },
    sectionTitle: { type: String, required: true },
    holderName: { type: String, required: true },
    holderEmail: { type: String, required: true },
    holderPhone: { type: String, required: true },
    qrCodeData: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.Active,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    checkedInAt: Date,
    checkedInBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ticketSchema.index({ eventId: 1, status: 1 });

export const Ticket: Model<TicketDocument> =
  mongoose.models.Ticket ?? mongoose.model<TicketDocument>("Ticket", ticketSchema);
