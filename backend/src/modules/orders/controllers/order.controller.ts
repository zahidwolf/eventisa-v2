import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { reserveInventory } from "@/modules/tickets/services/ticket-reservation.service.js";
import {
  createOrderFromReservation,
  getOrderById,
  cancelOrder,
  confirmFreeOrder,
} from "@/modules/orders/services/order.service.js";
import {
  buildCreateOrderResponse,
  buildReserveResponse,
} from "@/modules/orders/services/checkout-response.service.js";
import {
  onNewBooking,
  onTicketCancelled,
  onTicketConfirmed,
} from "@/shared/email/emailTriggers.service.js";

export const reserve = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, sectionId, quantity, sessionId } = req.body;

  const reservation = await reserveInventory({
    eventId,
    sectionId,
    quantity,
    sessionId,
    userId: req.user?.id,
  });

  const data = await buildReserveResponse(reservation);

  res.status(201).json({
    success: true,
    data,
    message: "Tickets reserved for 10 minutes",
  });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const order = await createOrderFromReservation(req.body, req.user?.id);
  const data = buildCreateOrderResponse(order);

  res.status(201).json({
    success: true,
    data,
    message: order.total > 0 ? "Order created. Proceed to payment." : "Order created. Confirm free ticket.",
  });
});

export const confirmFree = asyncHandler(async (req: Request, res: Response) => {
  const { order, tickets } = await confirmFreeOrder(req.params.id as string, req.body.sessionId);
  const orderRef = order._id.toString();
  onTicketConfirmed(orderRef).catch((err) => console.error("Email trigger failed:", err));
  onNewBooking(orderRef).catch((err) => console.error("Email trigger failed:", err));
  res.json({
    success: true,
    data: {
      orderId: order._id.toString(),
      status: order.paymentStatus,
      ticketCount: tickets.length,
    },
    message: "Free tickets confirmed",
  });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string | undefined;
  const order = await getOrderById(req.params.id as string, sessionId);
  const eventId =
    typeof order.eventId === "object" && order.eventId !== null && "_id" in order.eventId
      ? String((order.eventId as { _id: unknown })._id)
      : String(order.eventId);

  res.json({
    success: true,
    data: {
      orderId: order._id.toString(),
      status: order.paymentStatus,
      eventId,
      segmentId: order.ticketItems[0]?.sectionId,
      quantity: order.ticketItems.reduce((s, i) => s + i.quantity, 0),
      totalAmount: order.total,
    },
  });
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const order = await cancelOrder(req.params.id as string, req.body.sessionId);
  onTicketCancelled(order._id.toString(), "Cancelled by customer").catch((err) =>
    console.error("Email trigger failed:", err)
  );
  res.json({
    success: true,
    data: { orderId: order._id.toString(), status: order.orderStatus },
    message: "Order cancelled",
  });
});
