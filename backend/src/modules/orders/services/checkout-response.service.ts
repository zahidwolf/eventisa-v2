import mongoose from "mongoose";
import { env } from "@/config/env.js";
import { paymentConfig } from "@/config/payment.config.js";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { getServiceFeeRate } from "@/modules/admin/services/platformSettings.service.js";
import { Event } from "@/modules/events/models/event.model.js";
import { findTicketSection } from "@/modules/events/utils/section.util.js";
import { sectionDocId } from "@/modules/events/utils/event-builder.mapper.js";
import { getEventGatewayPublicInfo } from "@/modules/payments/services/gatewayManager.service.js";
import type { TicketReservationDocument } from "@/modules/tickets/models/ticket-reservation.model.js";
import type { OrderDocument } from "@/modules/orders/models/order.model.js";

function calculateTotals(subtotal: number, serviceFeeRate: number) {
  const serviceFee = Math.round(subtotal * serviceFeeRate);
  return { serviceFee, total: subtotal + serviceFee };
}

export async function buildReserveResponse(reservation: TicketReservationDocument) {
  const event = await Event.findById(reservation.eventId)
    .select("title startDate coverImage venue.name ticketSections")
    .lean();

  if (!event) {
    throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  }

  const section = findTicketSection(
    event as unknown as Parameters<typeof findTicketSection>[0],
    reservation.sectionId.toString()
  );
  const unitPrice = section?.price ?? 0;
  const subtotal = unitPrice * reservation.quantity;
  const serviceFeeRate = await getServiceFeeRate();
  const { serviceFee, total } = calculateTotals(subtotal, serviceFeeRate);
  const segmentId = section ? sectionDocId(section) : reservation.sectionId.toString();

  return {
    reservationId: reservation._id.toString(),
    expiresAt: reservation.expiresAt.toISOString(),
    eventId: reservation.eventId.toString(),
    segmentId,
    segmentName: section?.title ?? section?.name ?? "Ticket",
    quantity: reservation.quantity,
    unitPrice,
    subtotal,
    serviceFee,
    total,
    event: {
      title: event.title,
      startDate: event.startDate.toISOString(),
      coverImage: event.coverImage,
      venue: { name: event.venue?.name ?? "Venue TBA" },
    },
  };
}

export function buildCreateOrderResponse(order: OrderDocument) {
  const item = order.ticketItems[0];
  return {
    orderId: order._id.toString(),
    status: order.paymentStatus,
    eventId: order.eventId.toString(),
    segmentId: item?.sectionId ?? "",
    quantity: item?.quantity ?? 1,
    totalAmount: order.total,
    nextStep: "payment" as const,
  };
}

export async function buildPaymentInitializeResponse(input: {
  orderId: string;
  amount: number;
  redirectUrl?: string;
  eventId: mongoose.Types.ObjectId;
  provider: string;
  paymentId: string;
}) {
  const gateway = await getEventGatewayPublicInfo(input.eventId.toString());
  const mockPath = paymentConfig.urls.mockSimulatePath;
  const paymentUrl =
    input.redirectUrl ??
    `${env.CLIENT_URL}${mockPath}?paymentId=${encodeURIComponent(input.paymentId)}`;

  return {
    paymentUrl,
    orderId: input.orderId,
    amount: input.amount,
    gateway: {
      provider: gateway.provider,
      displayName: gateway.displayName,
    },
    paymentId: input.paymentId,
    redirectUrl: paymentUrl,
  };
}

export function buildPaymentVerifyResponse(input: {
  success: boolean;
  orderId: string;
  status: "paid" | "failed";
  message: string;
}) {
  return input;
}
