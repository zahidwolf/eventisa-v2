import mongoose from "mongoose";
import { Order } from "@/modules/orders/models/order.model.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Payment } from "@/modules/payments/models/payment.model.js";
import { Ticket } from "@/modules/tickets/models/ticket.model.js";
import {
  CheckIn,
  CheckInRecordStatus,
} from "@/modules/events/models/checkIn.model.js";
import { PaymentStatus, OrderStatus } from "@/modules/orders/types/order.types.js";

function displayStatus(order: { paymentStatus: PaymentStatus; orderStatus: OrderStatus }) {
  if (order.orderStatus === OrderStatus.Cancelled) return "cancelled";
  return order.paymentStatus;
}

export async function listAdminOrdersSlim(query: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (query.status && query.status !== "all") filter.paymentStatus = query.status;
  if (query.search?.trim()) {
    const q = query.search.trim();
    filter.$or = [
      { orderId: { $regex: q, $options: "i" } },
      { guestEmail: { $regex: q, $options: "i" } },
      { guestName: { $regex: q, $options: "i" } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .select(
        "orderId guestName guestEmail total discount coupon paymentMethod utmSource utmCampaign createdAt paymentStatus orderStatus ticketItems eventId"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  const eventIds = [...new Set(orders.map((o) => o.eventId.toString()))];
  const events = eventIds.length
    ? await Event.find({ _id: { $in: eventIds } })
        .select("title")
        .lean()
    : [];
  const eventMap = new Map(events.map((e) => [e._id.toString(), e.title]));

  const items = orders.map((o) => {
    const item = o.ticketItems[0];
    return {
      _id: o._id.toString(),
      createdAt: o.createdAt,
      status: displayStatus(o),
      buyer: { name: o.guestName, email: o.guestEmail },
      event: {
        _id: o.eventId.toString(),
        title: eventMap.get(o.eventId.toString()) ?? "—",
      },
      segment: { name: item?.sectionTitle ?? "—" },
      quantity: o.ticketItems.reduce((s, i) => s + i.quantity, 0),
      totalAmount: o.total,
      promoCode: o.coupon,
      discountAmount: o.discount ?? 0,
      paymentMethod: o.paymentMethod,
      utmSource: o.utmSource,
      utmCampaign: o.utmCampaign,
    };
  });

  return { orders: items, page, limit, total };
}

export async function getAdminOrderDetail(orderId: string) {
  const orderQuery = mongoose.isValidObjectId(orderId)
    ? { _id: orderId }
    : { orderId };
  const order = await Order.findOne(orderQuery).lean();
  if (!order) return null;

  const [event, payment, tickets] = await Promise.all([
    Event.findById(order.eventId)
      .select("title slug startDate venue category coverImage")
      .lean(),
    Payment.findOne({ orderId: order._id }).lean(),
    Ticket.find({ orderId: order._id }).lean(),
  ]);

  const checkIns = tickets.length
    ? await CheckIn.find({
        ticketId: { $in: tickets.map((t) => t.ticketNumber) },
        status: CheckInRecordStatus.Success,
      }).lean()
    : [];
  const checkInByTicket = new Map(checkIns.map((c) => [c.ticketId, c.scannedAt]));

  const item = order.ticketItems[0];
  const formAnswers = Object.fromEntries(
    (order.customFormResponses ?? []).map((r) => [r.fieldKey, r.value])
  );

  return {
    order: {
      _id: order._id.toString(),
      orderId: order.orderId,
      createdAt: order.createdAt,
      status: displayStatus(order),
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      serviceFee: order.serviceFee,
      discount: order.discount,
      total: order.total,
      promoCode: order.coupon,
      utmSource: order.utmSource,
      utmMedium: order.utmMedium,
      utmCampaign: order.utmCampaign,
      transactionRef: payment?.transactionId ?? payment?.paymentId,
    },
    buyer: {
      name: order.guestName,
      email: order.guestEmail,
      phone: order.guestPhone,
    },
    event,
    segment: {
      segmentId: item?.sectionId,
      name: item?.sectionTitle,
      quantity: order.ticketItems.reduce((s, i) => s + i.quantity, 0),
      unitPrice: item?.unitPrice,
    },
    formAnswers,
    tickets: tickets.map((t) => ({
      ticketNumber: t.ticketNumber,
      qrCodeData: t.qrCodeData,
      status: t.status,
      checkInAt: t.checkedInAt ?? checkInByTicket.get(t.ticketNumber),
    })),
  };
}

export async function listPendingRefundsSlim() {
  const orders = await Order.find({ paymentStatus: PaymentStatus.Refunded })
    .select("orderId guestName guestEmail total createdAt eventId")
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  const eventIds = [...new Set(orders.map((o) => o.eventId.toString()))];
  const events = await Event.find({ _id: { $in: eventIds } }).select("title").lean();
  const eventMap = new Map(events.map((e) => [e._id.toString(), e.title]));

  return orders.map((o) => ({
    _id: o._id.toString(),
    orderId: o.orderId,
    requestedAt: o.updatedAt ?? o.createdAt,
    status: "refunded",
    buyer: { name: o.guestName, email: o.guestEmail },
    event: { title: eventMap.get(o.eventId.toString()) ?? "—" },
    amount: o.total,
    reason: undefined,
  }));
}
