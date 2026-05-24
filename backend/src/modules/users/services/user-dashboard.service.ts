import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus, OrderStatus } from "@/modules/orders/types/order.types.js";
import { cacheGet, cacheSet } from "@/shared/cache/cache.service.js";
import {
  invalidateUserDashboardCache,
  userDashboardCacheKey,
} from "@/modules/users/utils/user-cache.util.js";
import { userOrderMatch } from "@/modules/users/utils/user-order-filter.util.js";
import { listUserTickets } from "@/modules/users/services/user-tickets-read.service.js";
import {
  getUserOrderDetail,
  getUserOrderTickets,
  listUserOrders,
} from "@/modules/users/services/user-orders-read.service.js";

export { invalidateUserDashboardCache };
export { listUserTickets, listUserOrders, getUserOrderDetail, getUserOrderTickets };

const DASHBOARD_TTL = 120;

export async function getDashboardStats(userId: string, email: string) {
  const cacheKey = userDashboardCacheKey(userId);
  const cached = cacheGet<{
    totalTickets: number;
    totalOrders: number;
    upcomingEvents: number;
    eventsAttended: number;
  }>(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const match = userOrderMatch(userId, email);

  const [stats] = await Order.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
    {
      $facet: {
        totalOrders: [{ $count: "count" }],
        paid: [
          { $match: { paymentStatus: PaymentStatus.Paid } },
          {
            $group: {
              _id: null,
              orders: { $sum: 1 },
              tickets: { $sum: { $sum: "$ticketItems.quantity" } },
            },
          },
        ],
        upcoming: [
          {
            $match: {
              paymentStatus: PaymentStatus.Paid,
              orderStatus: { $ne: OrderStatus.Cancelled },
              "event.startDate": { $gt: now },
            },
          },
          { $count: "count" },
        ],
        attended: [
          {
            $match: {
              paymentStatus: PaymentStatus.Paid,
              "event.startDate": { $lte: now },
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  const paid = stats?.paid?.[0];
  const result = {
    totalTickets: paid?.tickets ?? 0,
    totalOrders: stats?.totalOrders?.[0]?.count ?? 0,
    upcomingEvents: stats?.upcoming?.[0]?.count ?? 0,
    eventsAttended: stats?.attended?.[0]?.count ?? 0,
  };

  cacheSet(cacheKey, result, DASHBOARD_TTL);
  return result;
}
