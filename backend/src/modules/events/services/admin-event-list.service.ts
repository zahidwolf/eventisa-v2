import mongoose from "mongoose";
import { Event } from "@/modules/events/models/event.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
export interface AdminEventListQuery {
  search?: string;
  status?: string;
  category?: string;
  sort?: "newest" | "oldest" | "revenue" | "tickets";
  page?: number;
  limit?: number;
}

function buildMatch(query: AdminEventListQuery) {
  const match: Record<string, unknown> = {};
  if (query.search?.trim()) {
    match.title = { $regex: query.search.trim(), $options: "i" };
  }
  if (query.status && query.status !== "all") {
    match.status = query.status;
  }
  if (query.category) match.category = query.category;
  return match;
}

function sortStage(sort?: string): Record<string, 1 | -1> {
  switch (sort) {
    case "oldest":
      return { createdAt: 1 };
    case "revenue":
      return { revenue: -1, createdAt: -1 };
    case "tickets":
      return { ticketsSold: -1, createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
}

export async function aggregateAdminEventList(query: AdminEventListQuery) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const pipeline: mongoose.PipelineStage[] = [
    { $match: buildMatch(query) },
    {
      $lookup: {
        from: "orders",
        let: { eid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$eventId", "$$eid"] },
              paymentStatus: PaymentStatus.Paid,
            },
          },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$total" },
              ticketsSold: { $sum: { $sum: "$ticketItems.quantity" } },
            },
          },
        ],
        as: "orderStats",
      },
    },
    {
      $lookup: {
        from: "organizers",
        localField: "organizer",
        foreignField: "_id",
        as: "orgRow",
        pipeline: [{ $project: { businessName: 1, email: 1 } }],
      },
    },
    {
      $addFields: {
        revenue: { $ifNull: [{ $arrayElemAt: ["$orderStats.revenue", 0] }, 0] },
        ticketsSold: { $ifNull: [{ $arrayElemAt: ["$orderStats.ticketsSold", 0] }, 0] },
        capacity: {
          $sum: {
            $map: {
              input: { $ifNull: ["$ticketSections", []] },
              as: "s",
              in: "$$s.capacity",
            },
          },
        },
        orgDoc: { $arrayElemAt: ["$orgRow", 0] },
      },
    },
    {
      $project: {
        _id: 1,
        slug: 1,
        title: 1,
        status: 1,
        approvalStatus: 1,
        startDate: 1,
        category: 1,
        coverImage: 1,
        ticketsSold: 1,
        capacity: 1,
        revenue: 1,
        createdAt: 1,
        organizer: {
          _id: "$organizer",
          name: "$orgDoc.businessName",
          email: "$orgDoc.email",
        },
      },
    },
    { $sort: sortStage(query.sort) },
    {
      $facet: {
        rows: [{ $skip: skip }, { $limit: limit }],
        meta: [{ $count: "total" }],
      },
    },
  ];

  const [result] = await Event.aggregate<{
    rows: Array<Record<string, unknown>>;
    meta: Array<{ total: number }>;
  }>(pipeline);

  const events = (result?.rows ?? []).map((e) => ({
    _id: String(e._id),
    slug: String(e.slug),
    title: String(e.title),
    status: String(e.status),
    approvalStatus: String(e.approvalStatus),
    startDate: e.startDate,
    category: e.category,
    coverImage: e.coverImage,
    ticketsSold: Number(e.ticketsSold ?? 0),
    capacity: Number(e.capacity ?? 0),
    revenue: Number(e.revenue ?? 0),
    organizer: e.organizer as { _id: string; name: string; email: string },
  }));

  return { events, page, limit, total: result?.meta[0]?.total ?? 0 };
}
