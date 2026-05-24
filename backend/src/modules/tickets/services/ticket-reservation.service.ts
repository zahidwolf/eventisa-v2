import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { RESERVATION_TTL_MS } from "@/shared/constants/booking.constants.js";
import { getPlatformSettings } from "@/modules/admin/services/platformSettings.service.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { Event } from "@/modules/events/models/event.model.js";
import { findTicketSection } from "@/modules/events/utils/section.util.js";
import {
  isSegmentPurchasable,
  normalizeLiveEventTicketSections,
} from "@/modules/events/utils/segment.util.js";
import { EventStatus } from "@/modules/events/types/event.types.js";
import { TicketReservation } from "@/modules/tickets/models/ticket-reservation.model.js";
import { ReservationState } from "@/modules/tickets/types/reservation.types.js";
import { logger } from "@/config/logger.js";

export interface ReserveInventoryInput {
  eventId: string;
  sectionId: string;
  quantity: number;
  sessionId: string;
  userId?: string;
}

async function getActiveReservedQuantity(
  eventId: string,
  sectionId: string,
  session?: mongoose.ClientSession
): Promise<number> {
  const now = new Date();
  const pipeline = [
    {
      $match: {
        eventId: new mongoose.Types.ObjectId(eventId),
        sectionId: new mongoose.Types.ObjectId(sectionId),
        status: ReservationState.Reserved,
        expiresAt: { $gt: now },
      },
    },
    { $group: { _id: null, total: { $sum: "$quantity" } } },
  ];

  const agg = TicketReservation.aggregate(pipeline);
  if (session) agg.session(session);
  const result = await agg;

  return result[0]?.total ?? 0;
}

async function getUserTicketsHeldForEvent(
  eventId: string,
  userId?: string,
  sessionId?: string
): Promise<number> {
  if (!userId) return 0;

  const now = new Date();
  const [orderAgg, reservationAgg] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          eventId: new mongoose.Types.ObjectId(eventId),
          userId: new mongoose.Types.ObjectId(userId),
          paymentStatus: { $in: [PaymentStatus.Pending, PaymentStatus.Paid] },
        },
      },
      { $unwind: "$ticketItems" },
      { $group: { _id: null, total: { $sum: "$ticketItems.quantity" } } },
    ]),
    TicketReservation.aggregate([
      {
        $match: {
          eventId: new mongoose.Types.ObjectId(eventId),
          userId: new mongoose.Types.ObjectId(userId),
          status: ReservationState.Reserved,
          expiresAt: { $gt: now },
          ...(sessionId ? { sessionId: { $ne: sessionId } } : {}),
        },
      },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]),
  ]);

  return (orderAgg[0]?.total ?? 0) + (reservationAgg[0]?.total ?? 0);
}

export async function getSectionAvailability(
  eventId: string,
  sectionId: string
): Promise<{ capacity: number; sold: number; reserved: number; available: number }> {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  }

  const section = findTicketSection(event, sectionId);
  if (!section || !section.isVisible) {
    throw new AppError("Ticket section not found", 404, ErrorCodes.NOT_FOUND);
  }

  const reserved = await getActiveReservedQuantity(eventId, sectionId);
  const available = section.capacity - section.quantitySold - reserved;

  return {
    capacity: section.capacity,
    sold: section.quantitySold,
    reserved,
    available: Math.max(0, available),
  };
}

export async function reserveInventory(input: ReserveInventoryInput) {
  const session = await mongoose.startSession();

  try {
    let reservation;

    await session.withTransaction(async () => {
      const event = await Event.findById(input.eventId).session(session);
      if (!event) {
        throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
      }

      if (event.status === EventStatus.Live && normalizeLiveEventTicketSections(event)) {
        await event.save({ session });
      }

      const section = findTicketSection(event, input.sectionId);
      if (!section || !section.isVisible) {
        throw new AppError("Ticket section not available", 404, ErrorCodes.NOT_FOUND);
      }

      const segmentError = isSegmentPurchasable(
        section,
        input.quantity,
        new Date(),
        {
          start: event.registrationStart,
          end: event.registrationEnd,
        },
        event.status as EventStatus
      );
      if (segmentError) {
        throw new AppError(segmentError, 400, ErrorCodes.VALIDATION_ERROR);
      }

      if (input.quantity > section.maxPurchase) {
        throw new AppError(
          `Maximum ${section.maxPurchase} tickets per order for this section`,
          400,
          ErrorCodes.VALIDATION_ERROR
        );
      }

      const settings = await getPlatformSettings();
      const maxPerUser = settings.eventControls.maxTicketsPerUserPerEvent;
      if (maxPerUser > 0 && input.userId) {
        const held = await getUserTicketsHeldForEvent(
          input.eventId,
          input.userId,
          input.sessionId
        );
        if (held + input.quantity > maxPerUser) {
          throw new AppError(
            `Maximum ${maxPerUser} tickets per user for this event`,
            400,
            ErrorCodes.VALIDATION_ERROR
          );
        }
      }

      const reserved = await getActiveReservedQuantity(input.eventId, input.sectionId, session);
      const available = section.capacity - section.quantitySold - reserved;

      if (input.quantity > available) {
        throw new AppError(
          `Only ${available} ticket(s) available for ${section.title}`,
          409,
          ErrorCodes.CONFLICT
        );
      }

      const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);

      const [created] = await TicketReservation.create(
        [
          {
            eventId: input.eventId,
            sectionId: input.sectionId,
            quantity: input.quantity,
            status: ReservationState.Reserved,
            sessionId: input.sessionId,
            userId: input.userId,
            expiresAt,
          },
        ],
        { session }
      );

      reservation = created;
    });

    return reservation!;
  } finally {
    session.endSession();
  }
}

export async function releaseInventory(reservationId: string, sessionId: string) {
  const reservation = await TicketReservation.findOne({
    _id: reservationId,
    sessionId,
    status: ReservationState.Reserved,
  });

  if (!reservation) {
    throw new AppError("Reservation not found", 404, ErrorCodes.NOT_FOUND);
  }

  reservation.status = ReservationState.Cancelled;
  await reservation.save();
  return reservation;
}

export async function confirmReservation(
  reservationId: string,
  orderId: string,
  session?: mongoose.ClientSession
) {
  const reservation = await TicketReservation.findById(reservationId).session(session ?? null);
  if (!reservation || reservation.status !== ReservationState.Reserved) {
    throw new AppError("Invalid reservation", 400, ErrorCodes.VALIDATION_ERROR);
  }

  if (reservation.expiresAt < new Date()) {
    reservation.status = ReservationState.Expired;
    await reservation.save({ session });
    throw new AppError("Reservation expired", 410, ErrorCodes.VALIDATION_ERROR);
  }

  const event = await Event.findById(reservation.eventId).session(session ?? null);
  if (!event) {
    throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  }

  const section = findTicketSection(event, reservation.sectionId.toString());
  if (!section) {
    throw new AppError("Ticket section not found", 404, ErrorCodes.NOT_FOUND);
  }

  const reserved = await getActiveReservedQuantity(
    reservation.eventId.toString(),
    reservation.sectionId.toString(),
    session
  );

  const available = section.capacity - section.quantitySold - reserved + reservation.quantity;
  if (reservation.quantity > available) {
    throw new AppError("Inventory no longer available", 409, ErrorCodes.CONFLICT);
  }

  section.quantitySold += reservation.quantity;
  await event.save({ session });

  reservation.status = ReservationState.Paid;
  reservation.orderId = new mongoose.Types.ObjectId(orderId);
  await reservation.save({ session });

  return reservation;
}

/**
 * TODO: Run via cron job (node-cron / BullMQ) every minute in production.
 */
export async function cleanupExpiredReservations(): Promise<number> {
  const now = new Date();
  const result = await TicketReservation.updateMany(
    { status: ReservationState.Reserved, expiresAt: { $lt: now } },
    { $set: { status: ReservationState.Expired } }
  );

  if (result.modifiedCount > 0) {
    logger.info(`Expired ${result.modifiedCount} ticket reservation(s)`);
  }

  return result.modifiedCount;
}
