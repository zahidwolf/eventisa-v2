import type { PipelineStage } from "mongoose";
import { userOrderMatch } from "@/modules/users/utils/user-order-filter.util.js";

export function userOrderEventLookupStages(): PipelineStage[] {
  return [
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
        pipeline: [
          {
            $project: {
              title: 1,
              slug: 1,
              startDate: 1,
              endDate: 1,
              coverImage: 1,
              venue: 1,
              ticketSections: 1,
              organizer: 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: "$event", preserveNullAndEmptyArrays: false } },
  ];
}

export function userOrdersBaseMatch(userId: string, email: string): PipelineStage[] {
  return [{ $match: userOrderMatch(userId, email) }, ...userOrderEventLookupStages()];
}

export function firstTicketItemFields(): PipelineStage {
  return {
    $addFields: {
      firstItem: { $arrayElemAt: ["$ticketItems", 0] },
      quantity: {
        $reduce: {
          input: "$ticketItems",
          initialValue: 0,
          in: { $add: ["$$value", "$$this.quantity"] },
        },
      },
    },
  };
}

export function segmentFromEventFields(): PipelineStage {
  return {
    $addFields: {
      matchedSection: {
        $arrayElemAt: [
          {
            $filter: {
              input: { $ifNull: ["$event.ticketSections", []] },
              as: "sec",
              cond: {
                $or: [
                  { $eq: ["$$sec.segmentId", "$firstItem.sectionId"] },
                  { $eq: [{ $toString: "$$sec._id" }, "$firstItem.sectionId"] },
                ],
              },
            },
          },
          0,
        ],
      },
    },
  };
}
