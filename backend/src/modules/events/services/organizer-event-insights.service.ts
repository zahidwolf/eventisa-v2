import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Role } from "@/shared/enums/role.enum.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import {
  CheckIn,
  CheckInRecordStatus,
} from "@/modules/events/models/checkIn.model.js";
import { AttendeeSubmission } from "@/modules/events/models/attendeeSubmission.model.js";
import { PromoCode } from "@/modules/events/models/promoCode.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { getServiceFeeRate } from "@/modules/admin/services/platformSettings.service.js";
import { sectionDocId } from "@/modules/events/utils/event-builder.mapper.js";
import type { ITicketSection } from "@/modules/events/models/ticket-section.schema.js";
async function loadEventLean(eventId: string, userId: string, role?: Role) {
  if (role === Role.Admin || role === Role.SuperAdmin) {
    const event = await Event.findById(eventId)
      .select("title slug status approvalStatus startDate venue coverImage capacity ticketSections organizer")
      .lean();
    if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
    return event;
  }
  const organizer = await Organizer.findOne({ userId }).select("_id").lean();
  if (!organizer) throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);
  const event = await Event.findOne({ _id: eventId, organizer: organizer._id })
    .select("title slug status approvalStatus startDate venue coverImage capacity ticketSections organizer")
    .lean();
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

export async function getEventOverviewSlim(
  userId: string,
  eventId: string,
  role?: Role
) {
  const event = await loadEventLean(eventId, userId, role);
  const eid = event._id as mongoose.Types.ObjectId;
  const feeRate = await getServiceFeeRate();

  const [orderStats, checkedIn, activePromoCodes, recentSubs, recentCheckIns] =
    await Promise.all([
      Order.aggregate<{
        totalSold: number;
        revenue: number;
        bySection: Array<{ _id: string; sold: number; revenue: number }>;
      }>([
        { $match: { eventId: eid, paymentStatus: PaymentStatus.Paid } },
        { $unwind: "$ticketItems" },
        {
          $group: {
            _id: "$ticketItems.sectionId",
            sold: { $sum: "$ticketItems.quantity" },
            revenue: { $sum: "$ticketItems.lineTotal" },
          },
        },
        {
          $group: {
            _id: null,
            totalSold: { $sum: "$sold" },
            revenue: { $sum: "$revenue" },
            bySection: { $push: { _id: "$_id", sold: "$sold", revenue: "$revenue" } },
          },
        },
      ]),
      CheckIn.countDocuments({ eventId: eid, status: CheckInRecordStatus.Success }),
      PromoCode.countDocuments({
        eventId: eid,
        isActive: true,
        validUntil: { $gte: new Date() },
      }),
      AttendeeSubmission.find({ eventId: eid })
        .select("orderId segmentId answers submittedAt")
        .sort({ submittedAt: -1 })
        .limit(5)
        .lean(),
      CheckIn.find({ eventId: eid, status: CheckInRecordStatus.Success })
        .select("attendeeName segmentId scannedAt")
        .sort({ scannedAt: -1 })
        .limit(5)
        .lean(),
    ]);

  const statsRow = orderStats[0];
  const totalSold = statsRow?.totalSold ?? 0;
  const revenue = statsRow?.revenue ?? 0;
  const platformFee = Math.round(revenue * feeRate);
  const sectionMap = new Map(
    (statsRow?.bySection ?? []).map((s) => [s._id, { sold: s.sold, revenue: s.revenue }])
  );

  const segments = (event.ticketSections ?? []).map((sec) => {
    const s = sec as ITicketSection & { _id?: mongoose.Types.ObjectId };
    const id = sectionDocId(s);
    const agg = sectionMap.get(id) ?? sectionMap.get(s._id?.toString() ?? "");
    const sold = agg?.sold ?? s.quantitySold ?? 0;
    const cap = s.capacity ?? 0;
    return {
      segmentId: id,
      name: s.name ?? s.title,
      price: s.price,
      isFree: s.isFree,
      capacity: cap,
      sold,
      remaining: Math.max(0, cap - sold),
      revenue: agg?.revenue ?? 0,
      status: s.status,
      ticketColor: s.ticketColor,
      isSoldOut: cap > 0 && sold >= cap,
    };
  });

  const orderIds = recentSubs.map((s) => s.orderId);
  const orders = orderIds.length
    ? await Order.find({ orderId: { $in: orderIds }, eventId: eid })
        .select("orderId guestName guestEmail")
        .lean()
    : [];
  const orderByRef = new Map(orders.map((o) => [o.orderId, o]));

  const recentAttendees = recentSubs.map((sub) => {
    const sec = (event.ticketSections as ITicketSection[]).find(
      (x) => sectionDocId(x as ITicketSection & { _id?: mongoose.Types.ObjectId }) === sub.segmentId
    );
    const order = orderByRef.get(sub.orderId);
    const answers = sub.answers ?? {};
    const name =
      order?.guestName ||
      String(answers.name ?? answers.full_name ?? answers.guest_name ?? "Guest");
    const email = order?.guestEmail || String(answers.email ?? "");
    return {
      name,
      email,
      segmentName: sec?.name ?? sec?.title ?? sub.segmentId,
      createdAt: sub.submittedAt,
      purchasedAt: sub.submittedAt.toISOString(),
    };
  });

  const recentCheckInRows = recentCheckIns.map((r) => {
    const sec = (event.ticketSections as ITicketSection[]).find(
      (x) => sectionDocId(x as ITicketSection & { _id?: mongoose.Types.ObjectId }) === r.segmentId
    );
    return {
      attendeeName: r.attendeeName ?? "—",
      segmentName: sec?.name ?? sec?.title ?? r.segmentId,
      scannedAt: r.scannedAt,
    };
  });

  const capacity = segments.reduce((sum, s) => sum + s.capacity, 0);

  return {
    event: {
      _id: String(event._id),
      title: event.title,
      slug: event.slug,
      status: event.status,
      approvalStatus: event.approvalStatus,
      startDate: event.startDate,
      venue: event.venue,
      coverImage: event.coverImage,
    },
    stats: {
      totalSold,
      ticketsSold: totalSold,
      capacity,
      totalCapacity: capacity,
      revenue,
      checkedIn,
      checkedInCount: checkedIn,
      platformFee,
      netRevenue: revenue - platformFee,
      checkInRate: totalSold ? Math.round((checkedIn / totalSold) * 100) : 0,
      activePromoCodes,
    },
    segments,
    recentAttendees,
    recentCheckIns: recentCheckInRows,
  };
}

export async function getEventAnalyticsSlim(
  userId: string,
  eventId: string,
  role?: Role
) {
  await loadEventLean(eventId, userId, role);
  const eid = new mongoose.Types.ObjectId(eventId);
  const feeRate = await getServiceFeeRate();

  const [salesByDay, segmentBreakdown, checkInAgg, revenueRow] = await Promise.all([
    Order.aggregate<{ date: string; count: number; revenue: number }>([
      { $match: { eventId: eid, paymentStatus: PaymentStatus.Paid } },
      { $unwind: "$ticketItems" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: "$ticketItems.quantity" },
          revenue: { $sum: "$ticketItems.lineTotal" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1, revenue: 1 } },
    ]),
    Order.aggregate<{ name: string; sold: number; revenue: number; segmentId: string }>([
      { $match: { eventId: eid, paymentStatus: PaymentStatus.Paid } },
      { $unwind: "$ticketItems" },
      {
        $group: {
          _id: "$ticketItems.sectionId",
          name: { $first: "$ticketItems.sectionTitle" },
          sold: { $sum: "$ticketItems.quantity" },
          revenue: { $sum: "$ticketItems.lineTotal" },
        },
      },
      {
        $project: {
          segmentId: "$_id",
          name: 1,
          sold: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ]),
    CheckIn.countDocuments({ eventId: eid, status: CheckInRecordStatus.Success }),
    Order.aggregate<{ totalRevenue: number; totalSold: number }>([
      { $match: { eventId: eid, paymentStatus: PaymentStatus.Paid } },
      { $unwind: "$ticketItems" },
      {
        $group: {
          _id: null,
          totalSold: { $sum: "$ticketItems.quantity" },
          totalRevenue: { $sum: "$ticketItems.lineTotal" },
        },
      },
    ]),
  ]);

  const event = await Event.findById(eid).select("ticketSections").lean();
  const segmentBreakdownWithColor = segmentBreakdown.map((row) => {
    const sec = event?.ticketSections?.find(
      (s) =>
        sectionDocId(s as ITicketSection & { _id?: mongoose.Types.ObjectId }) === row.segmentId
    );
    return {
      ...row,
      color: (sec as ITicketSection | undefined)?.ticketColor,
    };
  });

  const totalSold = revenueRow[0]?.totalSold ?? 0;
  const totalRevenue = revenueRow[0]?.totalRevenue ?? 0;
  const platformFee = Math.round(totalRevenue * feeRate);
  const checkInRate = {
    checkedIn: checkInAgg,
    totalSold,
    percentage: totalSold ? Math.round((checkInAgg / totalSold) * 100) : 0,
  };

  const best = segmentBreakdown.reduce(
    (b, s) => (!b || s.sold > b.sold ? s : b),
    null as (typeof segmentBreakdown)[0] | null
  );

  return {
    salesByDay,
    segmentBreakdown: segmentBreakdownWithColor,
    checkInRate,
    summary: {
      totalRevenue,
      avgTicketPrice: totalSold ? Math.round(totalRevenue / totalSold) : 0,
      bestSegment: best?.name ?? "—",
      checkInRate: checkInRate.percentage,
      platformFee,
      netRevenue: totalRevenue - platformFee,
    },
  };
}
