import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Payout } from "@/modules/payments/models/payout.model.js";
import { PayoutStatus } from "@/modules/payments/types/payout.types.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { User } from "@/modules/users/models/user.model.js";
import { getServiceFeeRate } from "@/modules/admin/services/platformSettings.service.js";
import {
  buildBankingSnapshot,
  eventRevenueMap,
  getLockedEventIds,
  getMinimumPayoutAmount,
  isBankingConfigured,
  loadPayoutById,
  loadPayoutForOrganizer,
  payoutableEventFilter,
  resolveOrganizerByUserId,
} from "@/modules/payments/services/payout.helpers.js";
import {
  onPayoutApproved,
  onPayoutPaid,
  onPayoutRejected,
  onPayoutRequested,
} from "@/shared/email/emailTriggers.service.js";

export async function getPayoutableEvents(userId: string) {
  const { organizer } = await resolveOrganizerByUserId(userId);
  const locked = await getLockedEventIds(organizer._id);
  const revenue = await eventRevenueMap(organizer._id);

  const events = await Event.find(payoutableEventFilter(organizer._id))
    .select("title startDate endDate status")
    .sort({ startDate: -1 })
    .lean();

  const paidEventIds = new Set<string>();
  const paidPayouts = await Payout.find({
    organizerId: organizer._id,
    status: PayoutStatus.Paid,
  })
    .select("eventIds")
    .lean();
  for (const p of paidPayouts) {
    for (const id of p.eventIds ?? []) paidEventIds.add(id.toString());
  }

  return events
    .map((e) => {
      const id = e._id.toString();
      const stats = revenue.get(id);
      if (!stats || stats.orderCount < 1) return null;
      const inActivePayout = locked.has(id);
      if (inActivePayout) return null;
      return {
        eventId: id,
        title: e.title,
        startDate: e.startDate,
        endDate: e.endDate,
        grossRevenue: stats.grossRevenue,
        platformFee: stats.platformFee,
        netRevenue: stats.netRevenue,
        ticketsSold: stats.ticketsSold,
        alreadyPaidOut: paidEventIds.has(id),
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);
}

export async function getOrganizerEarningsSummary(userId: string) {
  const { organizer } = await resolveOrganizerByUserId(userId);
  const { getOrganizerPayoutSummaryCached } = await import(
    "@/modules/payments/services/organizer-payout-read.service.js"
  );
  return getOrganizerPayoutSummaryCached(organizer._id);
}

export async function createPayoutRequest(
  userId: string,
  eventIds: string[],
  requestNote?: string
) {
  const { organizer, user } = await resolveOrganizerByUserId(userId);
  const pay = organizer.paymentInfo as Record<string, unknown>;
  if (!isBankingConfigured(pay)) {
    throw new AppError("Add banking details before requesting a payout", 400, ErrorCodes.VALIDATION_ERROR);
  }

  if (!eventIds.length) {
    throw new AppError("Select at least one event", 400, ErrorCodes.VALIDATION_ERROR);
  }

  const objectIds = eventIds.map((id) => new mongoose.Types.ObjectId(id));
  const events = await Event.find({
    _id: { $in: objectIds },
    ...payoutableEventFilter(organizer._id),
  });

  if (events.length !== eventIds.length) {
    throw new AppError("One or more events are invalid or not eligible for payout", 400, ErrorCodes.VALIDATION_ERROR);
  }

  const locked = await getLockedEventIds(organizer._id);
  for (const e of events) {
    if (locked.has(e._id.toString())) {
      throw new AppError(`Event "${e.title}" is already included in a payout request`, 400, ErrorCodes.CONFLICT);
    }
  }

  const revenue = await eventRevenueMap(organizer._id);
  let grossAmount = 0;
  for (const e of events) {
    const stats = revenue.get(e._id.toString());
    if (!stats || stats.orderCount < 1) {
      throw new AppError(`Event "${e.title}" has no paid orders`, 400, ErrorCodes.VALIDATION_ERROR);
    }
    grossAmount += stats.grossRevenue;
  }

  const rate = await getServiceFeeRate();
  const platformFee = Math.round(grossAmount * rate);
  const netAmount = grossAmount - platformFee;
  const minimum = await getMinimumPayoutAmount();

  if (netAmount < minimum) {
    throw new AppError(`Minimum payout amount is ৳${minimum}`, 400, ErrorCodes.VALIDATION_ERROR);
  }

  const payout = await Payout.create({
    organizerId: organizer._id,
    organizerName: user.name || organizer.businessName,
    organizationName: organizer.businessName,
    eventIds: events.map((e) => e._id),
    eventTitles: events.map((e) => e.title),
    grossAmount,
    platformFee,
    netAmount,
    bankingSnapshot: buildBankingSnapshot(pay),
    requestNote,
    status: PayoutStatus.Pending,
  });

  void onPayoutRequested(payout._id.toString());
  const { invalidateOrganizerPayoutSummaryCache } = await import(
    "@/modules/payments/services/organizer-payout-read.service.js"
  );
  invalidateOrganizerPayoutSummaryCache(organizer._id.toString());
  return payout;
}

export async function getOrganizerPayouts(
  userId: string,
  filters: { status?: PayoutStatus; page?: number; limit?: number }
) {
  const { organizer } = await resolveOrganizerByUserId(userId);
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
  const query: Record<string, unknown> = { organizerId: organizer._id };
  if (filters.status) query.status = filters.status;

  const { mapOrganizerPayoutListItem } = await import(
    "@/modules/payments/services/organizer-payout-read.service.js"
  );

  const [items, total] = await Promise.all([
    Payout.find(query)
      .select(
        "status netAmount grossAmount platformFee requestedAt reviewedAt paidAt eventTitles rejectionReason"
      )
      .sort({ requestedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Payout.countDocuments(query),
  ]);

  return {
    items: items.map((p) => mapOrganizerPayoutListItem(p as Record<string, unknown>)),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export async function getOrganizerPayoutDetail(userId: string, payoutId: string) {
  const { organizer } = await resolveOrganizerByUserId(userId);
  const payout = await loadPayoutForOrganizer(payoutId, organizer._id);
  return payout.toObject();
}

export async function getAllPayouts(filters: {
  status?: PayoutStatus;
  organizerId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: Array<Record<string, unknown> & { eventsCount: number }>;
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 20));
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;
  if (filters.organizerId && mongoose.isValidObjectId(filters.organizerId)) {
    query.organizerId = new mongoose.Types.ObjectId(filters.organizerId);
  }
  if (filters.dateFrom || filters.dateTo) {
    query.requestedAt = {};
    if (filters.dateFrom) (query.requestedAt as Record<string, Date>).$gte = new Date(filters.dateFrom);
    if (filters.dateTo) (query.requestedAt as Record<string, Date>).$lte = new Date(filters.dateTo);
  }
  if (filters.search?.trim()) {
    const re = new RegExp(filters.search.trim(), "i");
    query.$or = [{ organizerName: re }, { organizationName: re }];
  }

  const [items, total] = await Promise.all([
    Payout.find(query)
      .select(
        "_id organizerName organizationName grossAmount platformFee netAmount status requestedAt reviewedAt paidAt eventTitles txRef eventIds"
      )
      .sort({ requestedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Payout.countDocuments(query),
  ]);

  return {
    items: items.map((p) => ({
      _id: String(p._id),
      organizerName: p.organizerName,
      organizationName: p.organizationName,
      grossAmount: p.grossAmount,
      platformFee: p.platformFee,
      netAmount: p.netAmount,
      status: p.status,
      requestedAt: p.requestedAt,
      reviewedAt: p.reviewedAt,
      paidAt: p.paidAt,
      eventTitles: p.eventTitles ?? [],
      txRef: p.status === "paid" ? p.txRef : undefined,
      eventsCount: p.eventIds?.length ?? 0,
    })),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export async function getPayoutDetail(payoutId: string) {
  const payout = await loadPayoutById(payoutId);
  const events = await Event.find({ _id: { $in: payout.eventIds } })
    .select("title startDate endDate")
    .lean();
  const revenue = await eventRevenueMap(payout.organizerId);
  const eventBreakdown = events.map((e) => {
    const id = e._id.toString();
    const stats = revenue.get(id) ?? { grossRevenue: 0, platformFee: 0, netRevenue: 0, ticketsSold: 0 };
    return {
      eventId: id,
      title: e.title,
      startDate: e.startDate,
      gross: stats.grossRevenue,
      fee: stats.platformFee,
      net: stats.netRevenue,
      ticketsSold: stats.ticketsSold,
    };
  });
  const organizer = await Organizer.findById(payout.organizerId).populate("userId", "email name");
  const userDoc = organizer?.userId as { email?: string } | null;
  return {
    payout: payout.toObject(),
    eventBreakdown,
    organizerEmail: userDoc?.email,
  };
}

export async function approvePayoutRequest(payoutId: string, adminUserId: string) {
  const payout = await loadPayoutById(payoutId);
  if (payout.status !== PayoutStatus.Pending) {
    throw new AppError("Only pending payouts can be approved", 400, ErrorCodes.VALIDATION_ERROR);
  }
  const admin = await User.findById(adminUserId);
  payout.status = PayoutStatus.Approved;
  payout.reviewedAt = new Date();
  payout.reviewedBy = new mongoose.Types.ObjectId(adminUserId);
  payout.reviewedByName = admin?.name ?? "Admin";
  await payout.save();
  void onPayoutApproved(payout._id.toString());
  const { invalidateOrganizerPayoutSummaryCache } = await import(
    "@/modules/payments/services/organizer-payout-read.service.js"
  );
  invalidateOrganizerPayoutSummaryCache(payout.organizerId.toString());
  const { invalidateAdminCachesOnModeration } = await import(
    "@/modules/admin/utils/admin-cache.util.js"
  );
  invalidateAdminCachesOnModeration();
  return payout;
}

export async function rejectPayoutRequest(payoutId: string, adminUserId: string, reason: string) {
  const payout = await loadPayoutById(payoutId);
  if (payout.status !== PayoutStatus.Pending) {
    throw new AppError("Only pending payouts can be rejected", 400, ErrorCodes.VALIDATION_ERROR);
  }
  const admin = await User.findById(adminUserId);
  payout.status = PayoutStatus.Rejected;
  payout.rejectionReason = reason;
  payout.reviewedAt = new Date();
  payout.reviewedBy = new mongoose.Types.ObjectId(adminUserId);
  payout.reviewedByName = admin?.name ?? "Admin";
  await payout.save();
  void onPayoutRejected(payout._id.toString(), reason);
  const { invalidateOrganizerPayoutSummaryCache } = await import(
    "@/modules/payments/services/organizer-payout-read.service.js"
  );
  invalidateOrganizerPayoutSummaryCache(payout.organizerId.toString());
  const { invalidateAdminCachesOnModeration } = await import(
    "@/modules/admin/utils/admin-cache.util.js"
  );
  invalidateAdminCachesOnModeration();
  return payout;
}

export async function markPayoutAsPaid(
  payoutId: string,
  adminUserId: string,
  txRef: string,
  paymentMethod: string,
  paymentNote?: string
) {
  const payout = await loadPayoutById(payoutId);
  if (payout.status !== PayoutStatus.Approved) {
    throw new AppError("Only approved payouts can be marked as paid", 400, ErrorCodes.VALIDATION_ERROR);
  }
  payout.status = PayoutStatus.Paid;
  payout.txRef = txRef;
  payout.paymentMethod = paymentMethod;
  payout.paymentNote = paymentNote;
  payout.paidAt = new Date();
  if (!payout.reviewedAt) payout.reviewedAt = new Date();
  await payout.save();
  void onPayoutPaid(payout._id.toString());
  const { invalidateOrganizerPayoutSummaryCache } = await import(
    "@/modules/payments/services/organizer-payout-read.service.js"
  );
  invalidateOrganizerPayoutSummaryCache(payout.organizerId.toString());
  const { invalidateAdminCachesOnModeration } = await import(
    "@/modules/admin/utils/admin-cache.util.js"
  );
  invalidateAdminCachesOnModeration();
  return payout;
}

export async function getAdminPayoutStats() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [statusAgg, paidMonth, feesAgg] = await Promise.all([
    Payout.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$netAmount" },
        },
      },
    ]),
    Payout.aggregate([
      { $match: { status: PayoutStatus.Paid, paidAt: { $gte: monthStart } } },
      { $group: { _id: null, amount: { $sum: "$netAmount" } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: PaymentStatus.Paid } },
      { $group: { _id: null, fees: { $sum: "$serviceFee" } } },
    ]),
  ]);

  const byStatus = Object.fromEntries(statusAgg.map((r) => [r._id, r]));
  return {
    totalPendingCount: byStatus[PayoutStatus.Pending]?.count ?? 0,
    totalPendingAmount: byStatus[PayoutStatus.Pending]?.amount ?? 0,
    totalApprovedCount: byStatus[PayoutStatus.Approved]?.count ?? 0,
    totalApprovedAmount: byStatus[PayoutStatus.Approved]?.amount ?? 0,
    totalPaidThisMonth: paidMonth[0]?.amount ?? 0,
    totalPaidAllTime: byStatus[PayoutStatus.Paid]?.amount ?? 0,
    totalPlatformFeesCollected: feesAgg[0]?.fees ?? 0,
  };
}
