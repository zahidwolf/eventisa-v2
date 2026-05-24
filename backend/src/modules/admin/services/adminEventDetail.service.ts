import mongoose from "mongoose";
import ExcelJS from "exceljs";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Role } from "@/shared/enums/role.enum.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Payment } from "@/modules/payments/models/payment.model.js";
import { Ticket } from "@/modules/tickets/models/ticket.model.js";
import { TicketStatus } from "@/modules/tickets/types/ticket.types.js";
import {
  OrderStatus,
  PaymentStatus,
} from "@/modules/orders/types/order.types.js";
import {
  CheckIn,
  CheckInRecordStatus,
} from "@/modules/events/models/checkIn.model.js";
import { PaymentRecordStatus } from "@/modules/payments/types/payment.types.js";
import { sectionDocId } from "@/modules/events/utils/event-builder.mapper.js";
import { SegmentStatus, SegmentVisibility } from "@/modules/events/models/ticketSegment.model.js";
import { getEventAnalyticsSlim } from "@/modules/events/services/organizer-event-insights.service.js";
import { getAdminEventOverviewSlim } from "@/modules/admin/services/admin-event-overview.service.js";

export interface EventBookingsQuery {
  search?: string;
  segmentId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: "newest" | "oldest" | "amount";
  page?: number;
  limit?: number;
}

function findSectionIndex(event: Awaited<ReturnType<typeof loadEvent>>, segmentId: string) {
  const idx = event.ticketSections.findIndex(
    (s) => sectionDocId(s) === segmentId || (s as { _id?: { toString(): string } })._id?.toString() === segmentId
  );
  if (idx < 0) throw new AppError("Segment not found", 404, ErrorCodes.NOT_FOUND);
  return idx;
}

async function loadEvent(eventId: string) {
  const event = await Event.findById(eventId).populate("organizer", "businessName slug email");
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

function displayStatus(order: { paymentStatus: PaymentStatus; orderStatus: OrderStatus }) {
  if (order.orderStatus === OrderStatus.Cancelled) return "cancelled";
  return order.paymentStatus;
}

function buildOrderFilter(eventId: string, query: EventBookingsQuery) {
  const filter: Record<string, unknown> = {
    eventId: new mongoose.Types.ObjectId(eventId),
  };
  if (query.segmentId) filter["ticketItems.sectionId"] = query.segmentId;
  if (query.status && query.status !== "all") {
    if (query.status === "cancelled") filter.orderStatus = OrderStatus.Cancelled;
    else filter.paymentStatus = query.status;
  }
  if (query.dateFrom || query.dateTo) {
    const range: Record<string, Date> = {};
    if (query.dateFrom) range.$gte = new Date(query.dateFrom);
    if (query.dateTo) range.$lte = new Date(query.dateTo);
    filter.createdAt = range;
  }
  if (query.search?.trim()) {
    const q = query.search.trim();
    filter.$or = [
      { orderId: { $regex: q, $options: "i" } },
      { guestName: { $regex: q, $options: "i" } },
      { guestEmail: { $regex: q, $options: "i" } },
    ];
  }
  return filter;
}

function sortSpec(sort?: string): Record<string, 1 | -1> {
  if (sort === "oldest") return { createdAt: 1 };
  if (sort === "amount") return { total: -1 };
  return { createdAt: -1 };
}

async function restoreSegmentInventory(
  eventId: mongoose.Types.ObjectId,
  sectionId: string,
  qty: number
) {
  const event = await Event.findById(eventId);
  if (!event) return;
  const idx = findSectionIndex(event, sectionId);
  const section = event.ticketSections[idx];
  const sold = Math.max(0, (section.quantitySold ?? 0) - qty);
  section.quantitySold = sold;
  section.remainingQuantity = Math.max(0, (section.capacity ?? 0) - sold);
  if (section.status === SegmentStatus.SoldOut && (section.remainingQuantity ?? 0) > 0) {
    section.status = SegmentStatus.Active;
  }
  event.markModified("ticketSections");
  await event.save();
}

export async function getAdminEventOverview(eventId: string) {
  const data = await getAdminEventOverviewSlim(eventId);
  if (!data) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return {
    eventInfo: data.eventInfo,
    stats: { ...data.stats, ...data.statsLegacy },
    segments: data.segments,
    recentAttendees: data.recentAttendees,
    recentCheckIns: data.recentCheckIns,
    event: data.event,
    segmentTotals: data.segments.reduce(
      (acc, s) => ({
        capacity: acc.capacity + s.capacity,
        sold: acc.sold + s.sold,
        remaining: acc.remaining + s.remaining,
        revenue: acc.revenue + s.revenue,
      }),
      { capacity: 0, sold: 0, remaining: 0, revenue: 0 }
    ),
  };
}

export async function getAdminEventAnalytics(eventId: string) {
  const analytics = await getEventAnalyticsSlim("", eventId, Role.Admin);
  const paid = await Order.aggregate<{ platformFee: number }>([
    { $match: { eventId: new mongoose.Types.ObjectId(eventId), paymentStatus: PaymentStatus.Paid } },
    { $group: { _id: null, platformFee: { $sum: "$serviceFee" } } },
  ]);
  const platformFeeEarned = paid[0]?.platformFee ?? 0;
  return { ...analytics, platformFeeEarned };
}

export async function getEventBookings(eventId: string, query: EventBookingsQuery) {
  await loadEvent(eventId);
  const filter = buildOrderFilter(eventId, query);
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 25));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .select(
        "orderId guestName guestEmail total discount coupon paymentMethod utmSource utmCampaign createdAt paymentStatus orderStatus ticketItems"
      )
      .sort(sortSpec(query.sort))
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  const rows = orders.map((o) => {
    const item = o.ticketItems[0];
    const qty = o.ticketItems.reduce((s, i) => s + i.quantity, 0);
    return {
      _id: o._id.toString(),
      id: o._id.toString(),
      orderId: o.orderId,
      createdAt: o.createdAt,
      status: displayStatus(o),
      buyer: { name: o.guestName, email: o.guestEmail },
      segment: { name: item?.sectionTitle ?? "—", segmentId: item?.sectionId },
      quantity: qty,
      totalAmount: o.total,
      promoCode: o.coupon,
      discountAmount: o.discount ?? 0,
      paymentMethod: o.paymentMethod,
      utmSource: o.utmSource,
      utmCampaign: o.utmCampaign,
      buyerName: o.guestName,
      buyerEmail: o.guestEmail,
      segmentName: item?.sectionTitle ?? "—",
      segmentId: item?.sectionId,
      amount: o.total,
      discount: o.discount ?? 0,
      paymentStatus: displayStatus(o),
      bookedAt: o.createdAt,
    };
  });

  return { rows, page, limit, total, totalPages: Math.ceil(total / limit) };
}

export async function getEventBookingDetail(eventId: string, orderKey: string) {
  const event = await loadEvent(eventId);
  const orderQuery = mongoose.isValidObjectId(orderKey)
    ? { _id: orderKey, eventId: event._id }
    : { orderId: orderKey, eventId: event._id };
  const order = await Order.findOne(orderQuery).lean();
  if (!order) throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);

  const payment = await Payment.findOne({ orderId: order._id }).lean();
  const tickets = await Ticket.find({ orderId: order._id, eventId: event._id }).lean();
  const checkIns = await CheckIn.find({
    eventId: event._id,
    ticketId: { $in: tickets.map((t) => t.ticketNumber) },
    status: CheckInRecordStatus.Success,
  }).lean();
  const checkInByTicket = new Map(checkIns.map((c) => [c.ticketId, c.scannedAt]));

  const item = order.ticketItems[0];
  const formAnswers = Object.fromEntries(
    (order.customFormResponses ?? []).map((r) => [r.fieldKey, r.value])
  );

  return {
    order: {
      id: order._id.toString(),
      orderId: order.orderId,
      bookedAt: order.createdAt,
      paymentMethod: order.paymentMethod,
      paymentStatus: displayStatus(order),
      orderStatus: order.orderStatus,
      subtotal: order.subtotal,
      serviceFee: order.serviceFee,
      discount: order.discount,
      total: order.total,
      promoCode: order.coupon,
      transactionRef: payment?.transactionId ?? payment?.paymentId,
    },
    buyer: {
      name: order.guestName,
      email: order.guestEmail,
      phone: order.guestPhone,
    },
    event: {
      title: event.title,
      startDate: event.startDate,
      venue: event.venue,
    },
    segment: {
      name: item?.sectionTitle,
      price: item?.unitPrice,
      quantity: order.ticketItems.reduce((s, i) => s + i.quantity, 0),
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

async function fetchAllBookingRows(eventId: string, query: EventBookingsQuery) {
  const filter = buildOrderFilter(eventId, query);
  const orders = await Order.find(filter).sort(sortSpec(query.sort)).lean();
  return orders.map((o) => {
    const item = o.ticketItems[0];
    return {
      orderId: o.orderId,
      buyerName: o.guestName,
      buyerEmail: o.guestEmail,
      segment: item?.sectionTitle ?? "",
      quantity: o.ticketItems.reduce((s, i) => s + i.quantity, 0),
      amount: o.total,
      promoCode: o.coupon ?? "",
      discount: o.discount ?? 0,
      status: displayStatus(o),
      bookedAt: o.createdAt.toISOString(),
    };
  });
}

export async function exportEventBookings(
  eventId: string,
  query: EventBookingsQuery,
  format: "csv" | "excel"
) {
  const rows = await fetchAllBookingRows(eventId, query);
  if (format === "csv") {
    const header = [
      "orderId",
      "buyerName",
      "buyerEmail",
      "segment",
      "quantity",
      "amount",
      "promoCode",
      "discount",
      "status",
      "bookedAt",
    ];
    const lines = [header.join(",")];
    for (const r of rows) {
      lines.push(
        [
          r.orderId,
          `"${r.buyerName.replace(/"/g, '""')}"`,
          r.buyerEmail,
          `"${r.segment.replace(/"/g, '""')}"`,
          r.quantity,
          r.amount,
          r.promoCode,
          r.discount,
          r.status,
          r.bookedAt,
        ].join(",")
      );
    }
    return { contentType: "text/csv; charset=utf-8", body: lines.join("\n"), filename: `bookings-${eventId}.csv` };
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Bookings");
  sheet.addRow([
    "Order ID",
    "Buyer",
    "Email",
    "Segment",
    "Qty",
    "Amount (BDT)",
    "Promo",
    "Discount",
    "Status",
    "Booked at",
  ]);
  for (const r of rows) {
    sheet.addRow([
      r.orderId,
      r.buyerName,
      r.buyerEmail,
      r.segment,
      r.quantity,
      r.amount,
      r.promoCode,
      r.discount,
      r.status,
      r.bookedAt,
    ]);
  }
  sheet.getRow(1).font = { bold: true };
  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  return {
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    body: buffer,
    filename: `bookings-${eventId}.xlsx`,
  };
}

export async function adminUpdateSegment(
  eventId: string,
  segmentId: string,
  updates: {
    status?: SegmentStatus;
    capacity?: number;
    isVisible?: boolean;
    visibility?: SegmentVisibility;
  }
) {
  const event = await loadEvent(eventId);
  const idx = findSectionIndex(event, segmentId);
  const section = event.ticketSections[idx];
  const sold = section.quantitySold ?? 0;

  if (updates.capacity != null) {
    if (updates.capacity < sold) {
      throw new AppError(
        `Capacity cannot be below sold count (${sold})`,
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }
    section.capacity = updates.capacity;
    section.remainingQuantity = updates.capacity - sold;
  }
  if (updates.status) section.status = updates.status;
  if (updates.isVisible != null) section.isVisible = updates.isVisible;
  if (updates.visibility) {
    section.visibility = updates.visibility;
    if (updates.visibility === SegmentVisibility.Hidden) section.isVisible = false;
  }
  event.markModified("ticketSections");
  await event.save();
  return section;
}

async function resolveOrder(eventId: string, orderKey: string) {
  const event = await loadEvent(eventId);
  const orderQuery = mongoose.isValidObjectId(orderKey)
    ? { _id: orderKey, eventId: event._id }
    : { orderId: orderKey, eventId: event._id };
  const order = await Order.findOne(orderQuery);
  if (!order) throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);
  return { event, order };
}

export async function adminIssueRefund(
  eventId: string,
  orderKey: string,
  _adminId: string,
  _reason?: string
) {
  const { order } = await resolveOrder(eventId, orderKey);
  if (order.paymentStatus !== PaymentStatus.Paid) {
    throw new AppError("Only paid orders can be refunded", 400, ErrorCodes.VALIDATION_ERROR);
  }

  for (const item of order.ticketItems) {
    await restoreSegmentInventory(order.eventId, item.sectionId, item.quantity);
  }

  await Ticket.updateMany(
    { orderId: order._id },
    { status: TicketStatus.Cancelled }
  );

  const payment = await Payment.findOne({ orderId: order._id });
  if (payment) {
    payment.status = PaymentRecordStatus.Refunded;
    await payment.save();
  }

  order.paymentStatus = PaymentStatus.Refunded;
  order.orderStatus = OrderStatus.Cancelled;
  await order.save();
  return order;
}

export async function adminCancelBooking(
  eventId: string,
  orderKey: string,
  _adminId: string,
  _reason?: string
) {
  const { order } = await resolveOrder(eventId, orderKey);
  if (order.orderStatus === OrderStatus.Cancelled) {
    throw new AppError("Order already cancelled", 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (order.paymentStatus === PaymentStatus.Paid) {
    throw new AppError("Use refund for paid orders", 400, ErrorCodes.VALIDATION_ERROR);
  }

  if (order.paymentStatus === PaymentStatus.Pending) {
    for (const item of order.ticketItems) {
      await restoreSegmentInventory(order.eventId, item.sectionId, item.quantity);
    }
  }

  order.orderStatus = OrderStatus.Cancelled;
  order.paymentStatus = PaymentStatus.Failed;
  await order.save();
  return order;
}

export async function adminResendConfirmationEmail(eventId: string, orderKey: string) {
  const { order } = await resolveOrder(eventId, orderKey);
  if (order.paymentStatus !== PaymentStatus.Paid) {
    throw new AppError("Confirmation only for paid orders", 400, ErrorCodes.VALIDATION_ERROR);
  }
  return { sent: true, orderId: order._id.toString() };
}

export async function getAdminEventHeader(eventId: string) {
  const event = await loadEvent(eventId);
  const org = event.organizer as { businessName?: string; email?: string; _id?: mongoose.Types.ObjectId };
  return {
    _id: event._id.toString(),
    title: event.title,
    slug: event.slug,
    status: event.status,
    approvalStatus: event.approvalStatus,
    startDate: event.startDate,
    venue: event.venue,
    organizer: {
      id: org?._id?.toString(),
      name: org?.businessName ?? "—",
      email: org?.email,
    },
  };
}
