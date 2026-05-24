import mongoose from "mongoose";
import { Event } from "@/modules/events/models/event.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { CheckInRecordStatus } from "@/modules/events/models/checkIn.model.js";
import { EventStatus } from "@/modules/events/types/event.types.js";
import type {
  OrganizerEventListQuery,
  OrganizerEventListStatus,
} from "@/modules/events/services/organizer-event-management.service.js";

function buildStatusFilter(status?: OrganizerEventListStatus) {
  if (!status || status === "all") return {};
  if (status === "published") return { status: EventStatus.Live };
  if (status === "ended") return { status: EventStatus.Ended };
  return {
    status: {
      $in: [EventStatus.Draft, EventStatus.Pending, EventStatus.Approved, EventStatus.Rejected],
    },
  };
}

function sortStage(sort?: string): Record<string, 1 | -1> {
  switch (sort) {
    case "oldest":
      return { createdAt: 1 };
    case "most_sold":
      return { ticketsSold: -1, updatedAt: -1 };
    case "revenue":
      return { revenue: -1, updatedAt: -1 };
    default:
      return { updatedAt: -1 };
  }
}

export async function aggregateOrganizerEventList(
  organizerId: mongoose.Types.ObjectId | null,
  query: OrganizerEventListQuery
) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const match: Record<string, unknown> = {
    ...buildStatusFilter(query.status),
  };
  if (organizerId) match.organizer = organizerId;
  if (query.search?.trim()) {
    match.title = { $regex: query.search.trim(), $options: "i" };
  }

  const pipeline: mongoose.PipelineStage[] = [
    { $match: match },
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
        from: "checkins",
        let: { eid: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$eventId", "$$eid"] },
              status: CheckInRecordStatus.Success,
            },
          },
          { $count: "count" },
        ],
        as: "checkInStats",
      },
    },
    {
      $addFields: {
        revenue: { $ifNull: [{ $arrayElemAt: ["$orderStats.revenue", 0] }, 0] },
        ticketsSold: { $ifNull: [{ $arrayElemAt: ["$orderStats.ticketsSold", 0] }, 0] },
        checkedInCount: { $ifNull: [{ $arrayElemAt: ["$checkInStats.count", 0] }, 0] },
        capacity: {
          $sum: {
            $map: {
              input: { $ifNull: ["$ticketSections", []] },
              as: "s",
              in: "$$s.capacity",
            },
          },
        },
        segmentCount: { $size: { $ifNull: ["$ticketSections", []] } },
      },
    },
    {
      $project: {
        _id: 1,
        slug: 1,
        title: 1,
        status: 1,
        startDate: 1,
        coverImage: 1,
        approvalStatus: 1,
        ticketsSold: 1,
        capacity: 1,
        revenue: 1,
        segmentCount: 1,
        checkedInCount: 1,
        updatedAt: 1,
        createdAt: 1,
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
    startDate: e.startDate,
    coverImage: e.coverImage as string | undefined,
    approvalStatus: String(e.approvalStatus),
    ticketsSold: Number(e.ticketsSold ?? 0),
    capacity: Number(e.capacity ?? 0),
    revenue: Number(e.revenue ?? 0),
    segmentCount: Number(e.segmentCount ?? 0),
    checkedInCount: Number(e.checkedInCount ?? 0),
  }));

  return {
    events,
    page,
    limit,
    total: result?.meta[0]?.total ?? 0,
  };
}
