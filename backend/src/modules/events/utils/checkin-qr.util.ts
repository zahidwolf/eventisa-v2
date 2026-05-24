import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Ticket, type TicketDocument } from "@/modules/tickets/models/ticket.model.js";
import { OrderStatus, PaymentStatus } from "@/modules/orders/types/order.types.js";
import { TicketStatus } from "@/modules/tickets/types/ticket.types.js";
import type { EventDocument } from "@/modules/events/models/event.model.js";
import { segmentIdsMatchingFilter, segmentMeta } from "@/modules/events/utils/attendee-row.util.js";

export interface DecodedQrPayload {
  ticketNumber?: string;
  eventId?: string;
  orderId?: string;
  segmentId?: string;
  ticketIndex?: number;
  bookingId?: string;
}

export function parseQrPayload(qrPayload: string): DecodedQrPayload {
  try {
    const raw = JSON.parse(qrPayload) as DecodedQrPayload;
    if (typeof raw !== "object" || raw === null) {
      throw new Error("Invalid payload");
    }
    return raw;
  } catch {
    throw new AppError("Invalid QR payload", 400, ErrorCodes.VALIDATION_ERROR);
  }
}

export interface ResolvedTicket {
  ticketId: string;
  ticket: TicketDocument;
  orderId: mongoose.Types.ObjectId;
  segmentId: string;
  attendeeName: string;
  segmentName: string;
  segmentColor?: string;
}

export async function resolveTicketFromQr(
  qrPayload: string,
  event: EventDocument
): Promise<ResolvedTicket | null> {
  const payload = parseQrPayload(qrPayload);
  const eventId = event._id.toString();

  if (payload.eventId && payload.eventId !== eventId) {
    throw new AppError("Ticket is for a different event", 400, ErrorCodes.VALIDATION_ERROR);
  }

  let ticket: TicketDocument | null = null;

  if (payload.ticketNumber) {
    ticket = await Ticket.findOne({ ticketNumber: payload.ticketNumber, eventId: event._id });
  } else if (payload.orderId) {
    const order = await Order.findOne(
      mongoose.isValidObjectId(payload.orderId)
        ? { _id: payload.orderId, eventId: event._id }
        : { orderId: payload.orderId, eventId: event._id }
    );
    if (!order) return null;

    const segmentRef = payload.segmentId ?? order.ticketItems[0]?.sectionId ?? "";
    const sectionIds = segmentIdsMatchingFilter(event, segmentRef);
    const tickets = await Ticket.find({
      orderId: order._id,
      eventId: event._id,
      sectionId: { $in: sectionIds },
    }).sort({ createdAt: 1 });

    const idx = payload.ticketIndex ?? 0;
    ticket = tickets[idx] ?? tickets[0] ?? null;
  }

  if (!ticket) return null;

  const order = await Order.findById(ticket.orderId);
  if (!order) return null;
  if (order.paymentStatus !== PaymentStatus.Paid) {
    throw new AppError("Order is not paid", 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (order.orderStatus === OrderStatus.Cancelled) {
    throw new AppError("Order was cancelled", 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (ticket.status === TicketStatus.Cancelled) {
    throw new AppError("Ticket is cancelled", 400, ErrorCodes.VALIDATION_ERROR);
  }

  const segId = ticket.sectionId;
  const meta = segmentMeta(event, segId);

  return {
    ticketId: ticket.ticketNumber,
    ticket,
    orderId: ticket.orderId,
    segmentId: segId,
    attendeeName: ticket.holderName,
    segmentName: meta.name,
    segmentColor: meta.color,
  };
}

