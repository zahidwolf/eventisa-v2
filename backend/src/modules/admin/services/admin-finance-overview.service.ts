import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { getServiceFeeRate } from "@/modules/admin/services/platformSettings.service.js";
import { cacheGet, cacheSet } from "@/shared/cache/cache.service.js";
import { ADMIN_FINANCE_OVERVIEW_KEY } from "@/modules/admin/utils/admin-cache.util.js";
import {
  growthPercent,
  startOfMonth,
  startOfLastMonth,
  endOfLastMonth,
} from "@/modules/admin/services/adminAnalytics.util.js";

export async function getAdminFinanceOverview() {
  const cached = cacheGet<Record<string, unknown>>(ADMIN_FINANCE_OVERVIEW_KEY);
  if (cached) return cached;

  const feeRate = await getServiceFeeRate();
  const monthStart = startOfMonth();
  const lastMonthStart = startOfLastMonth();
  const lastMonthEnd = endOfLastMonth();
  const paidMatch = { paymentStatus: PaymentStatus.Paid };

  const [allTime, thisMonth, lastMonth, revenueByDay, revenueByOrganizer, revenueByCategory] =
    await Promise.all([
      Order.aggregate([
        { $match: paidMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
      Order.aggregate([
        { $match: { ...paidMatch, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, revenue: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            ...paidMatch,
            createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
          },
        },
        { $group: { _id: null, revenue: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: paidMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 90 },
        { $project: { _id: 0, date: "$_id", revenue: 1 } },
      ]),
      Order.aggregate([
        { $match: paidMatch },
        {
          $group: {
            _id: "$organizerId",
            orders: { $sum: 1 },
            grossRevenue: { $sum: "$total" },
          },
        },
        { $sort: { grossRevenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "organizers",
            localField: "_id",
            foreignField: "_id",
            as: "org",
            pipeline: [{ $project: { businessName: 1 } }],
          },
        },
        {
          $lookup: {
            from: "events",
            let: { oid: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$organizer", "$$oid"] } } },
              { $count: "n" },
            ],
            as: "evCount",
          },
        },
        {
          $project: {
            name: { $arrayElemAt: ["$org.businessName", 0] },
            events: { $ifNull: [{ $arrayElemAt: ["$evCount.n", 0] }, 0] },
            orders: 1,
            grossRevenue: 1,
            platformFee: { $multiply: ["$grossRevenue", feeRate] },
            netPayout: {
              $subtract: ["$grossRevenue", { $multiply: ["$grossRevenue", feeRate] }],
            },
          },
        },
      ]),
      Order.aggregate([
        { $match: paidMatch },
        {
          $lookup: {
            from: "events",
            localField: "eventId",
            foreignField: "_id",
            as: "ev",
            pipeline: [{ $project: { category: 1 } }],
          },
        },
        { $unwind: "$ev" },
        {
          $group: {
            _id: "$ev.category",
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { revenue: -1 } },
        { $project: { _id: 0, category: "$_id", revenue: 1 } },
      ]),
    ]);

  const totalRevenue = allTime[0]?.totalRevenue ?? 0;
  const totalOrders = allTime[0]?.totalOrders ?? 0;
  const thisMonthRevenue = thisMonth[0]?.revenue ?? 0;
  const lastMonthRevenue = lastMonth[0]?.revenue ?? 0;

  const summary = {
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    momChangePercent: growthPercent(thisMonthRevenue, lastMonthRevenue),
    totalOrders,
    avgOrderValue: totalOrders ? Math.round(totalRevenue / totalOrders) : 0,
    totalPlatformFees: Math.round(totalRevenue * feeRate),
    revenueByDay,
    revenueByOrganizer,
    revenueByCategory,
  };

  cacheSet(ADMIN_FINANCE_OVERVIEW_KEY, summary, 300);
  return summary;
}
