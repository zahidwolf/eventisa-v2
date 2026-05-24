import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { Payment } from "@/modules/payments/models/payment.model.js";
import { PaymentRecordStatus } from "@/modules/payments/types/payment.types.js";
import {
  EventApprovalStatus,
  EventStatus,
} from "@/modules/events/types/event.types.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { OrganizerVerificationStatus } from "@/modules/organizers/types/organizer.types.js";
import { User } from "@/modules/users/models/user.model.js";
import { Role } from "@/shared/enums/role.enum.js";
import {
  approveOrganizer,
  rejectOrganizer,
  buildActivityFeed,
  getAdminNavCounts,
  listAdminOrganizers,
} from "@/modules/admin-platform/services/admin-platform.service.js";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export async function getAdminDashboard() {
  const today = startOfDay();
  const monthStart = startOfMonth();
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);

  const paidOrders = await Order.find({ paymentStatus: PaymentStatus.Paid }).lean();
  const todayOrders = paidOrders.filter((o) => new Date(o.createdAt) >= today);
  const monthOrders = paidOrders.filter((o) => new Date(o.createdAt) >= monthStart);

  const sum = (orders: typeof paidOrders) =>
    orders.reduce((s, o) => s + (o.total ?? 0), 0);

  const tickets = (orders: typeof paidOrders) =>
    orders.reduce((s, o) => s + o.ticketItems.reduce((n, i) => n + i.quantity, 0), 0);

  const pendingEvents = await Event.countDocuments({
    $or: [
      { approvalStatus: EventApprovalStatus.Pending },
      { status: EventStatus.Pending },
    ],
  });

  const failedPayments = await Payment.countDocuments({ status: PaymentRecordStatus.Failed });

  const bookingTrend = await Order.aggregate([
    {
      $match: {
        paymentStatus: PaymentStatus.Paid,
        createdAt: { $gte: since30 },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
        tickets: { $sum: { $sum: "$ticketItems.quantity" } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const userTrend = await User.aggregate([
    { $match: { createdAt: { $gte: since30 }, role: { $in: [Role.User, Role.Organizer] } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const now = new Date();
  const activeEvents = await Event.countDocuments({
    status: EventStatus.Live,
    endDate: { $gte: now },
  });

  const categoryBreakdown = await Event.aggregate([
    { $match: { status: EventStatus.Live } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  const cityBreakdown = await Event.aggregate([
    { $match: { status: EventStatus.Live } },
    { $group: { _id: "$city", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 7 },
  ]);

  const pendingList = await Event.find({
    $or: [
      { approvalStatus: EventApprovalStatus.Pending },
      { status: EventStatus.Pending },
    ],
  })
    .sort({ createdAt: 1 })
    .limit(5)
    .populate("organizer", "businessName slug")
    .select("title slug city category coverImage startDate createdAt approvalStatus status")
    .lean();

  const pendingOrganizersList = await Organizer.find({
    verificationStatus: OrganizerVerificationStatus.Pending,
  })
    .sort({ createdAt: 1 })
    .limit(5)
    .select("businessName slug email createdAt")
    .lean();

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(8)
    .select("orderId guestName total paymentStatus orderStatus createdAt")
    .lean();

  const topEvents = await Event.find({ status: EventStatus.Live })
    .sort({ listingRank: -1, homepagePriority: -1 })
    .limit(5)
    .select("title slug city trending featured")
    .lean();

  const topOrganizers = await Organizer.find({
    verificationStatus: OrganizerVerificationStatus.Approved,
  })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select("businessName slug")
    .lean();

  const totalRevenue = sum(paidOrders);
  const activityFeed = await buildActivityFeed(20);
  const navCounts = await getAdminNavCounts();

  return {
    metrics: {
      todayRevenue: sum(todayOrders),
      monthlyRevenue: sum(monthOrders),
      totalRevenue,
      totalUsers: await User.countDocuments({ role: { $in: [Role.User, Role.Organizer] } }),
      totalOrganizers: await Organizer.countDocuments({
        verificationStatus: OrganizerVerificationStatus.Approved,
      }),
      totalEvents: await Event.countDocuments(),
      publishedEvents: await Event.countDocuments({ status: EventStatus.Live }),
      liveEvents: await Event.countDocuments({ status: EventStatus.Live }),
      activeEvents,
      activeOrganizers: await Organizer.countDocuments({
        verificationStatus: OrganizerVerificationStatus.Approved,
      }),
      pendingApprovals: pendingEvents,
      pendingOrganizers: navCounts.pendingOrganizers,
      failedPayments,
      ticketsSold: tickets(paidOrders),
      pendingRefunds: navCounts.pendingRefunds,
      refundRequests: navCounts.pendingRefunds,
      pendingPayouts: navCounts.pendingPayouts,
    },
    charts: {
      bookingTrend: bookingTrend.map((r) => ({
        date: r._id,
        revenue: r.revenue,
        orders: r.orders,
        tickets: r.tickets ?? 0,
      })),
      userTrend: userTrend.map((r) => ({ date: r._id, count: r.count })),
      categories: categoryBreakdown.map((c) => ({ name: c._id, value: c.count })),
      cities: cityBreakdown.map((c) => ({ name: c._id, value: c.count })),
    },
    widgets: {
      pendingEvents: pendingList,
      pendingOrganizers: pendingOrganizersList,
      recentActivity: recentOrders,
      activityFeed,
      topEvents,
      topOrganizers,
      fraudAlerts: [],
    },
    navCounts,
  };
}

export { approveOrganizer, rejectOrganizer, listAdminOrganizers, getAdminNavCounts, buildActivityFeed };
