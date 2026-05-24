import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { generateTicketNumber } from "@/shared/utils/order-id.util.js";
import { Ticket } from "@/modules/tickets/models/ticket.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { TicketStatus } from "@/modules/tickets/types/ticket.types.js";

interface QrPayload {
  ticketNumber: string;
  bookingId: string;
  eventId: string;
  orderId: string;
}

export async function generateTicketsForOrder(orderId: string) {
  const order = await Order.findOne(
    orderId.length === 24 ? { _id: orderId } : { orderId }
  );

  if (!order) {
    throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);
  }

  if (order.paymentStatus !== PaymentStatus.Paid) {
    throw new AppError("Order must be paid before generating tickets", 400, ErrorCodes.VALIDATION_ERROR);
  }

  const existing = await Ticket.countDocuments({ orderId: order._id });
  if (existing > 0) {
    return Ticket.find({ orderId: order._id });
  }

  const tickets = [];

  for (const item of order.ticketItems) {
    for (let i = 0; i < item.quantity; i++) {
      const ticketNumber = generateTicketNumber();
      const payload: QrPayload = {
        ticketNumber,
        bookingId: order.orderId,
        eventId: order.eventId.toString(),
        orderId: order._id.toString(),
      };

      const qrCodeData = JSON.stringify(payload);

      tickets.push({
        ticketNumber,
        bookingId: order.orderId,
        orderId: order._id,
        eventId: order.eventId,
        sectionId: item.sectionId,
        sectionTitle: item.sectionTitle,
        holderName: order.guestName,
        holderEmail: order.guestEmail,
        holderPhone: order.guestPhone,
        qrCodeData,
        status: TicketStatus.Active,
        userId: order.userId,
      });
    }
  }

  return Ticket.insertMany(tickets);
}

export async function getTicketById(ticketId: string, userId?: string) {
  const ticket = await Ticket.findById(ticketId).populate(
    "eventId",
    "title slug startDate endDate venue coverImage city"
  );

  if (!ticket) {
    throw new AppError("Ticket not found", 404, ErrorCodes.NOT_FOUND);
  }

  if (userId && ticket.userId && ticket.userId.toString() !== userId) {
    throw new AppError("Ticket not found", 404, ErrorCodes.NOT_FOUND);
  }

  return ticket;
}

export async function listTicketsByOrder(orderId: string) {
  const order = await Order.findOne(
    orderId.length === 24 ? { _id: orderId } : { orderId }
  );
  if (!order) {
    throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);
  }
  return Ticket.find({ orderId: order._id }).populate(
    "eventId",
    "title slug startDate endDate venue coverImage city"
  );
}
