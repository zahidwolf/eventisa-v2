import type { PipelineStage } from "mongoose";
import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus, OrderStatus } from "@/modules/orders/types/order.types.js";
import type { TicketListFilter } from "@/modules/users/types/user-dashboard.types.js";
import { parseListPagination } from "@/modules/users/utils/user-pagination.util.js";
import {
  firstTicketItemFields,
  segmentFromEventFields,
  userOrdersBaseMatch,
} from "@/modules/users/utils/user-order-aggregate.util.js";

function ticketStatusFilter(filter: TicketListFilter, now: Date): PipelineStage[] {
  if (filter === "upcoming") {
    return [
      {
        $match: {
          paymentStatus: PaymentStatus.Paid,
          orderStatus: { $ne: OrderStatus.Cancelled },
          "event.startDate": { $gt: now },
        },
      },
    ];
  }
  if (filter === "past") {
    return [
      {
        $match: {
          paymentStatus: PaymentStatus.Paid,
          "event.startDate": { $lte: now },
        },
      },
    ];
  }
  if (filter === "cancelled") {
    return [
      {
        $match: {
          $or: [
            { orderStatus: OrderStatus.Cancelled },
            { paymentStatus: { $in: [PaymentStatus.Refunded, PaymentStatus.Failed] } },
          ],
        },
      },
    ];
  }
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

function projectTicketRow(): PipelineStage {
  return {
    $project: {
      _id: { $toString: "$_id" },
      orderId: 1,
      status: "$paymentStatus",
      paymentStatus: 1,
      orderStatus: 1,
      createdAt: 1,
      quantity: 1,
      totalAmount: "$total",
      event: {
        _id: { $toString: "$event._id" },
        title: "$event.title",
        slug: "$event.slug",
        startDate: "$event.startDate",
        endDate: "$event.endDate",
        coverImage: "$event.coverImage",
        venue: {
          name: { $ifNull: ["$event.venue.name", "Venue TBA"] },
          address: "$event.venue.address",
          city: "$event.venue.city",
        },
      },
      segment: {
        segmentId: {
          $ifNull: ["$matchedSection.segmentId", "$firstItem.sectionId"],
        },
        name: {
          $ifNull: ["$matchedSection.title", "$matchedSection.name", "$firstItem.sectionTitle"],
        },
        ticketColor: { $ifNull: ["$matchedSection.ticketColor", "#FF3EA5"] },
        price: { $ifNull: ["$matchedSection.price", "$firstItem.unitPrice", 0] },
      },
    },
  };
}

export async function listUserTickets(
  userId: string,
  email: string,
  query: { status?: TicketListFilter; search?: string; page?: number; limit?: number }
) {
  const { page, limit, skip, totalPages } = parseListPagination(query);
  const now = new Date();
  const filter = query.status ?? "all";

  const pipeline: PipelineStage[] = [
    ...userOrdersBaseMatch(userId, email),
    ...ticketStatusFilter(filter, now),
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
      projectTicketRow(),
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
      endDate: row.event.endDate ? (row.event.endDate as Date).toISOString() : undefined,
      bannerImage: row.event.coverImage,
    },
  }));

  return { data, total, page, limit, totalPages: totalPages(total) };
}
