import mongoose from "mongoose";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { OrganizerVerificationStatus } from "@/modules/organizers/types/organizer.types.js";

function maskLast4(value?: string) {
  if (!value || value.length < 4) return value ? "****" : undefined;
  return `****${value.slice(-4)}`;
}

export async function listAdminOrganizersSlim(query: {
  status?: "all" | "pending" | "approved" | "rejected";
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;

  const match: Record<string, unknown> = {};
  if (query.status && query.status !== "all") {
    match.verificationStatus = query.status;
  }
  if (query.search?.trim()) {
    match.businessName = { $regex: query.search.trim(), $options: "i" };
  }

  const [rows, total] = await Promise.all([
    Organizer.find(match)
      .select("businessName email organizationType verificationStatus logo createdAt userId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email")
      .lean(),
    Organizer.countDocuments(match),
  ]);

  const orgIds = rows.map((o) => o._id);
  const [eventCounts, revenueAgg] = await Promise.all([
    Event.aggregate<{ _id: mongoose.Types.ObjectId; count: number }>([
      { $match: { organizer: { $in: orgIds } } },
      { $group: { _id: "$organizer", count: { $sum: 1 } } },
    ]),
    Order.aggregate<{ _id: mongoose.Types.ObjectId; revenue: number }>([
      { $match: { organizerId: { $in: orgIds }, paymentStatus: PaymentStatus.Paid } },
      { $group: { _id: "$organizerId", revenue: { $sum: "$total" } } },
    ]),
  ]);

  const eventMap = new Map(eventCounts.map((r) => [r._id.toString(), r.count]));
  const revMap = new Map(revenueAgg.map((r) => [r._id.toString(), r.revenue]));

  const organizers = rows.map((o) => {
    const user = o.userId as { name?: string; email?: string } | null;
    const id = o._id.toString();
    return {
      _id: id,
      name: user?.name ?? o.businessName,
      email: user?.email ?? o.email,
      organizationName: o.businessName,
      orgType: o.organizationType,
      approvalStatus: o.verificationStatus,
      logo: o.logo,
      totalEvents: eventMap.get(id) ?? 0,
      totalRevenue: revMap.get(id) ?? 0,
      createdAt: o.createdAt,
    };
  });

  return { organizers, page, limit, total };
}

export async function listAdminPendingOrganizersSlim() {
  const rows = await Organizer.find({
    verificationStatus: OrganizerVerificationStatus.Pending,
  })
    .select(
      "businessName email organizationType description socialLinks phone licenseNumber verificationStatus createdAt userId"
    )
    .sort({ createdAt: 1 })
    .populate("userId", "name email phone")
    .lean();

  return rows.map((o) => {
    const user = o.userId as { name?: string; email?: string; phone?: string } | null;
    const links = o.socialLinks as Record<string, string> | undefined;
    return {
      _id: o._id.toString(),
      name: user?.name ?? o.businessName,
      email: user?.email ?? o.email,
      organizationName: o.businessName,
      orgType: o.organizationType,
      description: o.description ?? "",
      website: links?.website,
      phone: user?.phone ?? o.phone,
      licenseNumber: o.licenseNumber ?? "",
      approvalStatus: o.verificationStatus,
      createdAt: o.createdAt,
    };
  });
}

export async function getAdminOrganizerDetail(organizerId: string) {
  const org = await Organizer.findById(organizerId)
    .select(
      "businessName email organizationType description logo banner businessAddress city establishedYear licenseNumber phone socialLinks paymentInfo bankingVerified verificationStatus createdAt userId profileBio"
    )
    .populate("userId", "name email phone status createdAt isVerified")
    .lean();
  if (!org) return null;

  const oid = org._id as mongoose.Types.ObjectId;
  const [statsRow, recentEvents] = await Promise.all([
    Order.aggregate<{ totalRevenue: number; totalTicketsSold: number }>([
      { $match: { organizerId: oid, paymentStatus: PaymentStatus.Paid } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalTicketsSold: { $sum: { $sum: "$ticketItems.quantity" } },
        },
      },
    ]),
    Event.aggregate([
      { $match: { organizer: oid } },
      { $sort: { startDate: -1 } },
      { $limit: 5 },
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
          as: "stats",
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          status: 1,
          startDate: 1,
          ticketsSold: { $ifNull: [{ $arrayElemAt: ["$stats.ticketsSold", 0] }, 0] },
          revenue: { $ifNull: [{ $arrayElemAt: ["$stats.revenue", 0] }, 0] },
        },
      },
    ]),
  ]);

  const totalEvents = await Event.countDocuments({ organizer: oid });
  const pay = org.paymentInfo ?? {};
  const user = org.userId as unknown as Record<string, unknown> | null;

  return {
    _id: org._id.toString(),
    name: (user?.name as string) ?? org.businessName,
    email: (user?.email as string) ?? org.email,
    phone: (user?.phone as string) ?? org.phone,
    organizationName: org.businessName,
    orgType: org.organizationType,
    description: org.description,
    logo: org.logo,
    coverPhoto: org.banner,
    address: org.businessAddress,
    city: org.city,
    establishedYear: org.establishedYear,
    licenseNumber: org.licenseNumber,
    approvalStatus: org.verificationStatus,
    bankingVerified: org.bankingVerified,
    bio: org.profileBio,
    socialLinks: org.socialLinks,
    createdAt: org.createdAt,
    totalEvents,
    totalRevenue: statsRow[0]?.totalRevenue ?? 0,
    totalTicketsSold: statsRow[0]?.totalTicketsSold ?? 0,
    recentEvents: recentEvents.map((e) => ({
      _id: String(e._id),
      title: e.title,
      status: e.status,
      startDate: e.startDate,
      ticketsSold: Number(e.ticketsSold ?? 0),
      revenue: Number(e.revenue ?? 0),
    })),
    banking: {
      preferredMethod: pay.preferredPayoutMethod,
      bankName: pay.bankName,
      accountNumber: maskLast4(pay.accountNumber as string | undefined),
      accountName: pay.accountHolderName,
      branchName: pay.branchName,
      bkashNumber: maskLast4(pay.bkashNumber as string | undefined),
      nagadNumber: maskLast4(pay.nagadNumber as string | undefined),
      rocketNumber: maskLast4(pay.rocketNumber as string | undefined),
    },
  };
}
