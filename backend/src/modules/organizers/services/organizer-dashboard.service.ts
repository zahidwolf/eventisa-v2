import mongoose from "mongoose";
import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import {
  CheckIn,
  CheckInRecordStatus,
} from "@/modules/events/models/checkIn.model.js";
import { Payout } from "@/modules/payments/models/payout.model.js";
import { PayoutStatus } from "@/modules/payments/types/payout.types.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { EventStatus } from "@/modules/events/types/event.types.js";
import { cacheGet, cacheSet } from "@/shared/cache/cache.service.js";
import {
  invalidateOrganizerDashboardCache,
  organizerDashboardCacheKey,
} from "@/modules/organizers/utils/organizer-cache.util.js";

export { invalidateOrganizerDashboardCache };

export interface OrganizerDashboardStats {
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  upcomingEvents: number;
  totalCheckedIn: number;
  pendingPayouts: number;
}

export async function getOrganizerDashboardStats(
  organizerId: mongoose.Types.ObjectId
): Promise<OrganizerDashboardStats> {
  const key = organizerDashboardCacheKey(organizerId.toString());
  const cached = cacheGet<OrganizerDashboardStats>(key);
  if (cached) return cached;

  const now = new Date();
  const orgId = organizerId;

  const [eventsRow, ordersRow, checkInRow, payoutRow] = await Promise.all([
    Event.aggregate<{ totalEvents: number; upcomingEvents: number }>([
      { $match: { organizer: orgId } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          upcomingEvents: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$startDate", now] },
                    { $in: ["$status", [EventStatus.Live, EventStatus.Approved]] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    Order.aggregate<{ totalTicketsSold: number; totalRevenue: number }>([
      { $match: { organizerId: orgId, paymentStatus: PaymentStatus.Paid } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalTicketsSold: {
            $sum: {
              $reduce: {
                input: "$ticketItems",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.quantity"] },
              },
            },
          },
        },
      },
    ]),
    CheckIn.aggregate<{ total: number }>([
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "ev",
        },
      },
      { $unwind: "$ev" },
      {
        $match: {
          "ev.organizer": orgId,
          status: CheckInRecordStatus.Success,
        },
      },
      { $count: "total" },
    ]),
    Payout.aggregate<{ pendingPayouts: number }>([
      {
        $match: {
          organizerId: orgId,
          status: { $in: [PayoutStatus.Pending, PayoutStatus.Approved] },
        },
      },
      { $group: { _id: null, pendingPayouts: { $sum: "$netAmount" } } },
    ]),
  ]);

  const stats: OrganizerDashboardStats = {
    totalEvents: eventsRow[0]?.totalEvents ?? 0,
    upcomingEvents: eventsRow[0]?.upcomingEvents ?? 0,
    totalTicketsSold: ordersRow[0]?.totalTicketsSold ?? 0,
    totalRevenue: ordersRow[0]?.totalRevenue ?? 0,
    totalCheckedIn: checkInRow[0]?.total ?? 0,
    pendingPayouts: payoutRow[0]?.pendingPayouts ?? 0,
  };

  cacheSet(key, stats, 120);
  return stats;
}
