import { Event } from "@/modules/events/models/event.model.js";
import {
  EventApprovalStatus,
  EventStatus,
} from "@/modules/events/types/event.types.js";

export async function aggregateAdminPendingEvents() {
  const rows = await Event.aggregate([
    {
      $match: {
        $or: [
          { approvalStatus: EventApprovalStatus.Pending },
          { status: EventStatus.Pending },
        ],
      },
    },
    { $sort: { createdAt: 1 } },
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
        orgDoc: { $arrayElemAt: ["$orgRow", 0] },
        segmentCount: { $size: { $ifNull: ["$ticketSections", []] } },
        prices: {
          $map: {
            input: { $ifNull: ["$ticketSections", []] },
            as: "s",
            in: { $cond: ["$$s.isFree", 0, "$$s.price"] },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        slug: 1,
        title: 1,
        category: 1,
        startDate: 1,
        endDate: 1,
        coverImage: 1,
        approvalStatus: 1,
        createdAt: 1,
        segmentCount: 1,
        priceRange: {
          min: { $min: "$prices" },
          max: { $max: "$prices" },
        },
        organizer: {
          _id: "$organizer",
          name: "$orgDoc.businessName",
          email: "$orgDoc.email",
          organizationName: "$orgDoc.businessName",
        },
      },
    },
  ]);

  return rows.map((e) => ({
    _id: String(e._id),
    slug: String(e.slug),
    title: String(e.title),
    category: e.category,
    startDate: e.startDate,
    endDate: e.endDate,
    coverImage: e.coverImage,
    approvalStatus: String(e.approvalStatus),
    createdAt: e.createdAt,
    segmentCount: Number(e.segmentCount ?? 0),
    priceRange: {
      min: Number(e.priceRange?.min ?? 0),
      max: Number(e.priceRange?.max ?? 0),
    },
    organizer: e.organizer,
  }));
}
