import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import {
  DEFAULT_CURRENCY,
} from "@/shared/constants/booking.constants.js";
import { getServiceFeeRate } from "@/modules/admin/services/platformSettings.service.js";
import { generateOrderId } from "@/shared/utils/order-id.util.js";
import { Order, type OrderDocument } from "@/modules/orders/models/order.model.js";
import {
  OrderReservationStatus,
  OrderStatus,
  PaymentStatus,
} from "@/modules/orders/types/order.types.js";
import type { CreateOrderInput } from "@/modules/orders/validators/order.validator.js";
import { Event } from "@/modules/events/models/event.model.js";
import { findTicketSection } from "@/modules/events/utils/section.util.js";
import { TicketReservation } from "@/modules/tickets/models/ticket-reservation.model.js";
import { ReservationState } from "@/modules/tickets/types/reservation.types.js";
import { confirmReservation } from "@/modules/tickets/services/ticket-reservation.service.js";
import { validateUniversityRegistration } from "@/modules/events/utils/university-validation.util.js";
import {
  resolveSegmentFormFields,
  validateFormResponses,
} from "@/modules/forms/services/form-validation.service.js";
import { generateTicketsForOrder } from "@/modules/tickets/services/ticket.service.js";
import { saveSubmission } from "@/modules/events/services/attendeeData.service.js";
import { sectionDocId } from "@/modules/events/utils/event-builder.mapper.js";
import {
  applyCode,
  validateCode,
} from "@/modules/events/services/promoCode.service.js";

function calculateTotals(subtotal: number, discount = 0, serviceFeeRate = 0.05) {
  const serviceFee = Math.round(subtotal * serviceFeeRate);
  const total = Math.max(0, subtotal + serviceFee - discount);
  return { serviceFee, total };
}

export async function createOrderFromReservation(input: CreateOrderInput, userId?: string) {
  const reservation = await TicketReservation.findOne({
    _id: input.reservationId,
    sessionId: input.sessionId,
    status: ReservationState.Reserved,
  });

  if (!reservation) {
    throw new AppError("Reservation not found or expired", 404, ErrorCodes.NOT_FOUND);
  }

  if (reservation.expiresAt < new Date()) {
    reservation.status = ReservationState.Expired;
    await reservation.save();
    throw new AppError("Reservation expired. Please select tickets again.", 410, ErrorCodes.VALIDATION_ERROR);
  }

  const event = await Event.findById(reservation.eventId).populate("organizer");
  if (!event) {
    throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  }

  const section = findTicketSection(event, reservation.sectionId.toString());
  if (!section) {
    throw new AppError("Ticket section not found", 404, ErrorCodes.NOT_FOUND);
  }

  validateUniversityRegistration(event.university, {
    email: input.guest.email,
    studentId: input.guest.studentId,
  });

  const formConfig = resolveSegmentFormFields(section, event.customForm);
  const responses = (input.customFormResponses ?? []).map((r) => ({
    fieldKey: r.fieldKey,
    sectionId: section._id?.toString(),
    value: r.value,
  }));
  validateFormResponses(formConfig.fields, responses, { enabled: formConfig.enabled });

  const lineTotal = section.price * reservation.quantity;
  const subtotal = lineTotal;
  let discount = 0;
  let couponCode: string | undefined;

  if (input.coupon?.trim()) {
    const segmentId = sectionDocId(section);
    const promo = await validateCode(
      input.coupon,
      event._id.toString(),
      segmentId,
      section.isFree ? 0 : section.price,
      reservation.quantity,
      { userId, guestEmail: input.guest.email }
    );
    if (!promo.valid) {
      throw new AppError(promo.message ?? "Invalid promo code", 400, ErrorCodes.VALIDATION_ERROR);
    }
    discount = promo.discountAmount;
    couponCode = promo.code;
  }

  const serviceFeeRate = await getServiceFeeRate();
  const { serviceFee, total } = calculateTotals(subtotal, discount, serviceFeeRate);

  const order = await Order.create({
    orderId: generateOrderId(),
    guestEmail: input.guest.email,
    guestPhone: input.guest.phone,
    guestName: input.guest.name,
    userId,
    eventId: event._id,
    organizerId: event.organizer,
    reservationId: reservation._id,
    ticketItems: [
      {
        sectionId: section._id?.toString() ?? reservation.sectionId.toString(),
        sectionTitle: section.title,
        quantity: reservation.quantity,
        unitPrice: section.price,
        lineTotal,
      },
    ],
    subtotal,
    serviceFee,
    discount,
    coupon: couponCode,
    total,
    currency: DEFAULT_CURRENCY,
    paymentStatus: PaymentStatus.Pending,
    orderStatus: OrderStatus.Draft,
    reservationStatus: OrderReservationStatus.Reserved,
    customFormResponses: input.customFormResponses,
    utmSource: input.utmSource?.trim() || undefined,
    utmMedium: input.utmMedium?.trim() || undefined,
    utmCampaign: input.utmCampaign?.trim() || undefined,
    expiresAt: reservation.expiresAt,
  });

  if (userId) {
    const { invalidateUserDashboardCache } = await import(
      "@/modules/users/utils/user-cache.util.js"
    );
    invalidateUserDashboardCache(userId);
  }

  return order;
}

export async function getOrderById(orderId: string, sessionId?: string) {
  const query = mongoose.isValidObjectId(orderId)
    ? { _id: orderId }
    : { orderId };

  const order = await Order.findOne(query).populate("eventId", "title slug startDate venue coverImage");

  if (!order) {
    throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);
  }

  if (sessionId) {
    const reservation = await TicketReservation.findById(order.reservationId);
    if (reservation?.sessionId !== sessionId) {
      throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);
    }
  }

  return order;
}

export async function cancelOrder(orderId: string, sessionId: string) {
  const order = await getOrderById(orderId, sessionId);

  if (order.paymentStatus === PaymentStatus.Paid) {
    throw new AppError("Cannot cancel a paid order", 400, ErrorCodes.VALIDATION_ERROR);
  }

  const reservation = await TicketReservation.findById(order.reservationId);
  if (reservation && reservation.status === ReservationState.Reserved) {
    reservation.status = ReservationState.Cancelled;
    await reservation.save();
  }

  order.orderStatus = OrderStatus.Cancelled;
  order.reservationStatus = OrderReservationStatus.Released;
  order.paymentStatus = PaymentStatus.Failed;
  await order.save();

  return order;
}

export async function completeOrderPayment(orderId: string, sessionId: string, paymentMethod = "manual") {
  const session = await mongoose.startSession();
  let order: OrderDocument | null | undefined;
  let promoToApply: string | undefined;

  try {
    await session.withTransaction(async () => {
      order = await Order.findOne(
        mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderId }
      ).session(session);

      if (!order) {
        throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);
      }

      const reservation = await TicketReservation.findById(order.reservationId).session(session);
      if (!reservation || reservation.sessionId !== sessionId) {
        throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);
      }

      if (order.paymentStatus === PaymentStatus.Paid) {
        return;
      }

      await confirmReservation(order.reservationId.toString(), order._id.toString(), session);

      order.paymentStatus = PaymentStatus.Paid;
      order.orderStatus = OrderStatus.Confirmed;
      order.reservationStatus = OrderReservationStatus.Reserved;
      order.paymentMethod = paymentMethod;
      promoToApply = order.coupon;
      await order.save({ session });
    });
  } finally {
    session.endSession();
  }

  if (promoToApply && order) {
    await applyCode(promoToApply, order.eventId.toString());
  }

  if (order) {
    const { invalidateOrganizerCachesForOrder } = await import(
      "@/modules/organizers/utils/organizer-cache.util.js"
    );
    invalidateOrganizerCachesForOrder(order.organizerId.toString());

    if (order.userId) {
      const { invalidateUserDashboardCache } = await import(
        "@/modules/users/utils/user-cache.util.js"
      );
      invalidateUserDashboardCache(order.userId.toString());
    }
  }

  return order!;
}

/** Confirms zero-total orders without payment gateway. */
export async function confirmFreeOrder(orderId: string, sessionId: string) {
  const existing = await getOrderById(orderId, sessionId);
  if (existing.total > 0) {
    throw new AppError("Order requires payment", 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (existing.paymentStatus === PaymentStatus.Paid) {
    return { order: existing, tickets: [] };
  }
  const order = await completeOrderPayment(orderId, sessionId, "free");
  const tickets = await generateTicketsForOrder(order._id.toString());

  const event = await Event.findById(order.eventId);
  const sectionId = order.ticketItems[0]?.sectionId;
  if (event && sectionId && order.customFormResponses?.length) {
    const section = event.ticketSections.find((s) => {
      const doc = s as { _id?: { toString(): string } };
      return sectionDocId(s) === sectionId || doc._id?.toString() === sectionId;
    });
    await saveSubmission({
      orderId: order.orderId,
      eventId: event._id.toString(),
      segmentId: section ? sectionDocId(section) : sectionId,
      userId: order.userId?.toString(),
      answers: Object.fromEntries(
        order.customFormResponses.map((r: { fieldKey: string; value: unknown }) => [
          r.fieldKey,
          r.value,
        ])
      ),
    });
  }

  return { order, tickets };
}
