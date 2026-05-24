import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { User } from "@/modules/users/models/user.model.js";
import {
  EventApprovalStatus,
  EventStatus,
} from "@/modules/events/types/event.types.js";
import { PaymentStatus, OrderStatus } from "@/modules/orders/types/order.types.js";
import { OrganizerVerificationStatus } from "@/modules/organizers/types/organizer.types.js";
import { Role } from "@/shared/enums/role.enum.js";
import {
  cached,
  daysAgo,
  endOfLastMonth,
  fillDailySeries,
  growthPercent,
  overviewCache,
  seriesCache,
  startOfDay,
  startOfLastMonth,
  startOfMonth,
  type AnalyticsDays,
} from "@/modules/admin/services/adminAnalytics.util.js";

const USER_ROLES = [Role.User, Role.Organizer];

const paidMatch = { paymentStatus: PaymentStatus.Paid };

async function sumRevenue(match: Record<string, unknown> = paidMatch) {
  const [row] = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        tickets: { $sum: { $sum: "$ticketItems.quantity" } },
      },
    },
  ]);
  return {
    revenue: row?.revenue ?? 0,
    orders: row?.orders ?? 0,
    tickets: row?.tickets ?? 0,
  };
}

export async function getPlatformOverview() {
  return cached(overviewCache, "admin_analytics_overview", async () => {
    const today = startOfDay();
    const monthStart = startOfMonth();
    const lastMonthStart = startOfLastMonth();
    const lastMonthEnd = endOfLastMonth();

    const [
      totalUsers,
      newUsersToday,
      newUsersThisMonth,
      newUsersLastMonth,
      totalEvents,
      liveEvents,
      pendingApproval,
      totalEventsThisMonth,
      allPaid,
      monthPaid,
      lastMonthPaid,
      todayPaid,
      totalOrganizers,
      approvedOrganizers,
      pendingOrganizers,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: USER_ROLES } }),
      User.countDocuments({ role: { $in: USER_ROLES }, createdAt: { $gte: today } }),
      User.countDocuments({ role: { $in: USER_ROLES }, createdAt: { $gte: monthStart } }),
      User.countDocuments({
        role: { $in: USER_ROLES },
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),
      Event.countDocuments(),
      Event.countDocuments({ status: EventStatus.Live }),
      Event.countDocuments({
        $or: [
          { approvalStatus: EventApprovalStatus.Pending },
          { status: EventStatus.Pending },
        ],
      }),
      Event.countDocuments({ createdAt: { $gte: monthStart } }),
      sumRevenue(),
      sumRevenue({ ...paidMatch, createdAt: { $gte: monthStart } }),
      sumRevenue({
        ...paidMatch,
        createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
      }),
      sumRevenue({ ...paidMatch, createdAt: { $gte: today } }),
      Organizer.countDocuments(),
      Organizer.countDocuments({ verificationStatus: OrganizerVerificationStatus.Approved }),
      Organizer.countDocuments({ verificationStatus: OrganizerVerificationStatus.Pending }),
    ]);

    return {
      totalUsers,
      newUsersToday,
      newUsersThisMonth,
      userGrowthPercent: growthPercent(newUsersThisMonth, newUsersLastMonth),
      totalEvents,
      liveEvents,
      pendingApproval,
      totalEventsThisMonth,
      totalTicketsSold: allPaid.tickets,
      totalRevenue: allPaid.revenue,
      revenueThisMonth: monthPaid.revenue,
      revenueLastMonth: lastMonthPaid.revenue,
      revenueGrowthPercent: growthPercent(monthPaid.revenue, lastMonthPaid.revenue),
      avgOrderValue: allPaid.orders > 0 ? Math.round(allPaid.revenue / allPaid.orders) : 0,
      totalOrders: allPaid.orders,
      totalOrganizers,
      approvedOrganizers,
      pendingOrganizers,
      todayRevenue: todayPaid.revenue,
      todayTickets: todayPaid.tickets,
      todayOrders: todayPaid.orders,
      todayNewUsers: newUsersToday,
    };
  });
}

export async function getRevenueOverTime(days: AnalyticsDays) {
  return cached(seriesCache, `admin_analytics_revenue_${days}`, async () => {
    const since = daysAgo(days);
    const rows = await Order.aggregate([
      { $match: { ...paidMatch, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1 } },
    ]);
    return fillDailySeries(rows, days, (date) => ({ date, revenue: 0, orders: 0 }));
  });
}

export async function getTicketsSoldOverTime(days: AnalyticsDays) {
  return cached(seriesCache, `admin_analytics_tickets_${days}`, async () => {
    const since = daysAgo(days);
    const rows = await Order.aggregate([
      { $match: { ...paidMatch, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          tickets: { $sum: { $sum: "$ticketItems.quantity" } },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", tickets: 1 } },
    ]);
    return fillDailySeries(rows, days, (date) => ({ date, tickets: 0 }));
  });
}

export async function getUserGrowthOverTime(days: AnalyticsDays) {
  return cached(seriesCache, `admin_analytics_users_${days}`, async () => {
    const since = daysAgo(days);
    const rows = await User.aggregate([
      { $match: { role: { $in: USER_ROLES }, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", users: 1 } },
    ]);
    return fillDailySeries(rows, days, (date) => ({ date, users: 0 }));
  });
}

export async function getEventCreationOverTime(days: AnalyticsDays) {
  return cached(seriesCache, `admin_analytics_events_${days}`, async () => {
    const since = daysAgo(days);
    const rows = await Event.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          events: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", events: 1 } },
    ]);
    return fillDailySeries(rows, days, (date) => ({ date, events: 0 }));
  });
}

export async function getRevenueByCategory() {
  return cached(seriesCache, "admin_analytics_by_category", async () => {
    const rows = await Order.aggregate([
      { $match: paidMatch },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $group: {
          _id: "$event.category",
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $project: { _id: 0, category: { $ifNull: ["$_id", "Uncategorized"] }, revenue: 1, orders: 1 } },
    ]);
    const total = rows.reduce((s, r) => s + r.revenue, 0);
    return rows.map((r) => ({
      ...r,
      percentage: total > 0 ? Math.round((r.revenue / total) * 1000) / 10 : 0,
    }));
  });
}

export async function getRevenueByCity() {
  return cached(seriesCache, "admin_analytics_by_city", async () => {
    return Order.aggregate([
      { $match: paidMatch },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: "$event" },
      {
        $group: {
          _id: "$event.city",
          revenue: { $sum: "$total" },
          events: { $addToSet: "$eventId" },
        },
      },
      {
        $project: {
          _id: 0,
          city: { $ifNull: ["$_id", "Unknown"] },
          revenue: 1,
          events: { $size: "$events" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);
  });
}

export async function getTopEventsByRevenue(limit = 10) {
  return Order.aggregate([
    { $match: paidMatch },
    {
      $group: {
        _id: "$eventId",
        revenue: { $sum: "$total" },
        ticketsSold: { $sum: { $sum: "$ticketItems.quantity" } },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "events",
        localField: "_id",
        foreignField: "_id",
        as: "event",
      },
    },
    { $unwind: "$event" },
    {
      $lookup: {
        from: "organizers",
        localField: "event.organizer",
        foreignField: "_id",
        as: "organizer",
      },
    },
    { $unwind: { path: "$organizer", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        eventId: { $toString: "$_id" },
        title: "$event.title",
        organizerName: { $ifNull: ["$organizer.businessName", "—"] },
        revenue: 1,
        ticketsSold: 1,
        category: { $ifNull: ["$event.category", "—"] },
      },
    },
  ]);
}

export async function getTopOrganizersByRevenue(limit = 10) {
  return Order.aggregate([
    { $match: paidMatch },
    {
      $group: {
        _id: "$organizerId",
        totalRevenue: { $sum: "$total" },
        totalTicketsSold: { $sum: { $sum: "$ticketItems.quantity" } },
        eventIds: { $addToSet: "$eventId" },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "organizers",
        localField: "_id",
        foreignField: "_id",
        as: "organizer",
      },
    },
    { $unwind: "$organizer" },
    {
      $project: {
        _id: 0,
        organizerId: { $toString: "$_id" },
        name: "$organizer.businessName",
        organizationName: "$organizer.businessName",
        totalRevenue: 1,
        totalEvents: { $size: "$eventIds" },
        totalTicketsSold: 1,
      },
    },
  ]);
}

export async function getOrderStatusBreakdown() {
  return cached(seriesCache, "admin_analytics_order_status", async () => {
    const rows = await Order.aggregate([
      {
        $project: {
          status: {
            $cond: [
              { $eq: ["$orderStatus", OrderStatus.Cancelled] },
              "cancelled",
              "$paymentStatus",
            ],
          },
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);
    const total = rows.reduce((s, r) => s + r.count, 0);
    return rows.map((r) => ({
      status: r.status,
      count: r.count,
      percentage: total > 0 ? Math.round((r.count / total) * 1000) / 10 : 0,
    }));
  });
}

export async function getTicketsBySegmentType() {
  return cached(seriesCache, "admin_analytics_segments", async () => {
    return Order.aggregate([
      { $match: paidMatch },
      { $unwind: "$ticketItems" },
      {
        $group: {
          _id: "$ticketItems.sectionTitle",
          count: { $sum: "$ticketItems.quantity" },
          revenue: { $sum: "$ticketItems.lineTotal" },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 20 },
      { $project: { _id: 0, segmentName: "$_id", count: 1, revenue: 1 } },
    ]);
  });
}

export async function getRecentOrders(limit = 10) {
  return Order.find({ paymentStatus: PaymentStatus.Paid })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({ path: "eventId", select: "title" })
    .select("orderId guestName total createdAt eventId")
    .lean()
    .then((rows) =>
      rows.map((o) => ({
        orderId: o.orderId,
        buyerName: o.guestName,
        eventTitle: (o.eventId as { title?: string })?.title ?? "Event",
        amount: o.total,
        createdAt: o.createdAt,
      }))
    );
}

export async function getRecentEvents(limit = 10) {
  return Event.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("organizer", "businessName")
    .select("title status approvalStatus createdAt organizer")
    .lean()
    .then((rows) =>
      rows.map((e) => ({
        eventId: e._id.toString(),
        title: e.title,
        organizerName: (e.organizer as { businessName?: string })?.businessName ?? "—",
        status: e.status,
        createdAt: e.createdAt,
      }))
    );
}

export async function getRecentOrganizers(limit = 5) {
  return Organizer.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("businessName verificationStatus createdAt")
    .lean()
    .then((rows) =>
      rows.map((o) => ({
        organizerId: o._id.toString(),
        name: o.businessName,
        orgName: o.businessName,
        approvalStatus: o.verificationStatus,
        createdAt: o.createdAt,
      }))
    );
}

export async function getRecentActivity() {
  const [recentOrders, recentEvents, recentOrganizers] = await Promise.all([
    getRecentOrders(10),
    getRecentEvents(10),
    getRecentOrganizers(5),
  ]);
  return { recentOrders, recentEvents, recentOrganizers };
}
