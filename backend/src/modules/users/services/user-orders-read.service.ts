import mongoose, { type PipelineStage } from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Payment } from "@/modules/payments/models/payment.model.js";
import { Ticket } from "@/modules/tickets/models/ticket.model.js";
import { PaymentStatus, OrderStatus } from "@/modules/orders/types/order.types.js";
import { findTicketSection } from "@/modules/events/utils/section.util.js";
import { sectionDocId } from "@/modules/events/utils/event-builder.mapper.js";
import type { OrderListFilter } from "@/modules/users/types/user-dashboard.types.js";
import { userOrderMatch } from "@/modules/users/utils/user-order-filter.util.js";
import { parseListPagination } from "@/modules/users/utils/user-pagination.util.js";
import {
  firstTicketItemFields,
  segmentFromEventFields,
  userOrdersBaseMatch,
} from "@/modules/users/utils/user-order-aggregate.util.js";

function orderListFilter(filter: OrderListFilter): PipelineStage[] {
  if (filter === "paid") return [{ $match: { paymentStatus: PaymentStatus.Paid } }];
  if (filter === "cancelled") return [{ $match: { orderStatus: OrderStatus.Cancelled } }];
  if (filter === "refunded") return [{ $match: { paymentStatus: PaymentStatus.Refunded } }];
  return [];
}

function searchStage(search: string): PipelineStage[] {
  const q = search.trim();
  if (!q) return [];
  return [
    {
      $match: {
        $or: [
          { orderId: { $regex: q, $options: "i" } },
          { "event.title": { $regex: q, $options: "i" } },
        ],
      },
    },
  ];
}

function projectOrderListRow(): PipelineStage {
  return {
    $project: {
      _id: { $toString: "$_id" },
      orderId: 1,
      createdAt: 1,
      status: "$paymentStatus",
      paymentStatus: 1,
      orderStatus: 1,
      quantity: 1,
      totalAmount: "$total",
      subtotal: 1,
      serviceFee: 1,
      promoCode: "$coupon",
      discountAmount: { $ifNull: ["$discount", 0] },
      paymentMethod: 1,
      event: {
        _id: { $toString: "$event._id" },
        title: "$event.title",
        slug: "$event.slug",
        startDate: "$event.startDate",
        coverImage: "$event.coverImage",
      },
      segment: {
        name: {
          $ifNull: ["$matchedSection.title", "$matchedSection.name", "$firstItem.sectionTitle"],
        },
        segmentId: {
          $ifNull: ["$matchedSection.segmentId", "$firstItem.sectionId"],
        },
      },
    },
  };
}

export async function listUserOrders(
  userId: string,
  email: string,
  query: { status?: OrderListFilter; search?: string; page?: number; limit?: number }
) {
  const { page, limit, skip, totalPages } = parseListPagination(query);
  const filter = query.status ?? "all";

  const pipeline: PipelineStage[] = [
    ...userOrdersBaseMatch(userId, email),
    ...orderListFilter(filter),
    ...searchStage(query.search ?? ""),
    firstTicketItemFields(),
    segmentFromEventFields(),
  ];

  const [countResult, rows] = await Promise.all([
    Order.aggregate<{ total: number }>([...pipeline, { $count: "total" }]),
    Order.aggregate([
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      projectOrderListRow(),
    ]),
  ]);

  const total = countResult[0]?.total ?? 0;
  const data = rows.map((row) => ({
    ...row,
    createdAt: (row.createdAt as Date).toISOString(),
    paymentStatus: row.paymentStatus ?? row.status,
    event: {
      ...row.event,
      startDate: (row.event.startDate as Date).toISOString(),
      bannerImage: row.event.coverImage,
    },
  }));

  return { data, total, page, limit, totalPages: totalPages(total) };
}

async function assertUserOwnsOrder(userId: string, email: string, orderId: string) {
  const idMatch = mongoose.isValidObjectId(orderId) ? { _id: orderId } : { orderId };
  const order = await Order.findOne({
    $and: [userOrderMatch(userId, email), idMatch],
  })
    .select("_id")
    .lean();

  if (!order) {
    throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);
  }
  return order._id;
}

export async function getUserOrderDetail(userId: string, email: string, orderId: string) {
  const orderOid = await assertUserOwnsOrder(userId, email, orderId);

  const [order, payment, tickets] = await Promise.all([
    Order.findById(orderOid)
      .select(
        "orderId ticketItems subtotal serviceFee discount coupon total currency paymentStatus orderStatus paymentMethod customFormResponses utmSource utmMedium utmCampaign createdAt eventId"
      )
      .lean(),
    Payment.findOne({ orderId: orderOid })
      .select("transactionId paymentId")
      .sort({ createdAt: -1 })
      .lean(),
    Ticket.find({ orderId: orderOid })
      .select("ticketNumber qrCodeData status checkedInAt createdAt")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  if (!order) {
    throw new AppError("Order not found", 404, ErrorCodes.NOT_FOUND);
  }

  const event = await Event.findById(order.eventId)
    .select("title slug startDate endDate coverImage venue ticketSections")
    .populate({ path: "organizer", select: "businessName" })
    .lean();

  const item = order.ticketItems[0];
  const section = event
    ? findTicketSection(event as unknown as Parameters<typeof findTicketSection>[0], item?.sectionId ?? "")
    : undefined;
  const segmentId = section ? sectionDocId(section) : item?.sectionId ?? "";

  const formAnswers = Object.fromEntries(
    (order.customFormResponses ?? []).map((r) => [r.fieldKey, r.value])
  );

  return {
    _id: order._id.toString(),
    createdAt: order.createdAt.toISOString(),
    status: order.paymentStatus,
    quantity: order.ticketItems.reduce((s, i) => s + i.quantity, 0),
    totalAmount: order.total,
    subtotal: order.subtotal,
    serviceFee: order.serviceFee,
    promoCode: order.coupon,
    discountAmount: order.discount ?? 0,
    paymentMethod: order.paymentMethod,
    txRef: payment?.transactionId,
    utmSource: order.utmSource,
    utmMedium: order.utmMedium,
    utmCampaign: order.utmCampaign,
    event: {
      _id: event?._id.toString() ?? order.eventId.toString(),
      title: event?.title ?? "Event",
      slug: event?.slug ?? "",
      startDate: event?.startDate.toISOString() ?? "",
      endDate: event?.endDate?.toISOString(),
      coverImage: event?.coverImage,
      bannerImage: event?.coverImage,
      venue: {
        name: event?.venue?.name ?? "Venue TBA",
        address: event?.venue?.address,
        city: event?.venue?.city,
        mapUrl: event?.venue?.mapUrl,
      },
      organizer: {
        name: (event?.organizer as { businessName?: string } | undefined)?.businessName,
      },
      organizerName: (event?.organizer as { businessName?: string } | undefined)?.businessName,
    },
    segment: {
      segmentId,
      name: section?.title ?? section?.name ?? item?.sectionTitle ?? "Ticket",
      ticketColor: section?.ticketColor ?? "#FF3EA5",
      price: section?.price ?? item?.unitPrice ?? 0,
      description: section?.description,
    },
    formAnswers,
    tickets: tickets.map((t, index) => ({
      ticketIndex: index + 1,
      qrData: t.qrCodeData,
      status: t.status,
      checkedInAt: t.checkedInAt?.toISOString(),
    })),
    orderId: order.orderId,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    currency: order.currency,
  };
}

export async function getUserOrderTickets(userId: string, email: string, orderId: string) {
  const orderOid = await assertUserOwnsOrder(userId, email, orderId);

  const tickets = await Ticket.find({ orderId: orderOid })
    .select("ticketNumber qrCodeData sectionTitle status holderName checkedInAt")
    .sort({ createdAt: 1 })
    .lean();

  return tickets.map((t, index) => ({
    ticketIndex: index + 1,
    ticketNumber: t.ticketNumber,
    qrData: t.qrCodeData,
    sectionTitle: t.sectionTitle,
    status: t.status,
    holderName: t.holderName,
    checkedInAt: t.checkedInAt?.toISOString(),
  }));
}
