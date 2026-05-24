import { Role } from "@/shared/enums/role.enum.js";
import { Event } from "@/modules/events/models/event.model.js";
import { getEventOverviewSlim } from "@/modules/events/services/organizer-event-insights.service.js";

export async function getAdminEventOverviewSlim(eventId: string) {
  const overview = await getEventOverviewSlim("", eventId, Role.Admin);
  const eventLean = await Event.findById(eventId)
    .select(
      "title slug category startDate endDate status approvalStatus coverImage venue createdAt organizer"
    )
    .populate("organizer", "businessName email")
    .lean();

  if (!eventLean) return null;

  const org = eventLean.organizer as { businessName?: string; email?: string } | null;
  const stats = overview.stats;

  const eventInfo = {
    _id: String(eventLean._id),
    slug: eventLean.slug,
    title: eventLean.title,
    category: eventLean.category,
    startDate: eventLean.startDate,
    endDate: eventLean.endDate,
    status: eventLean.status,
    approvalStatus: eventLean.approvalStatus,
    coverImage: eventLean.coverImage,
    venue: eventLean.venue,
    organizer: { name: org?.businessName ?? "—", email: org?.email },
    createdAt: eventLean.createdAt,
    approvedAt: undefined,
    approvedBy: undefined,
  };

  const slimStats = {
    totalSold: stats.totalSold ?? stats.ticketsSold,
    capacity: stats.capacity ?? stats.totalCapacity,
    revenue: stats.revenue,
    platformFee: stats.platformFee,
    netRevenue: stats.netRevenue,
    checkedIn: stats.checkedIn ?? stats.checkedInCount,
    checkInRate: stats.checkInRate,
    activePromoCodes: stats.activePromoCodes,
  };

  return {
    eventInfo,
    stats: slimStats,
    segments: overview.segments.map((s) => ({
      segmentId: s.segmentId,
      name: s.name,
      price: s.price,
      isFree: s.isFree,
      capacity: s.capacity,
      sold: s.sold,
      remaining: s.remaining,
      revenue: s.revenue,
      status: s.status,
    })),
    recentAttendees: overview.recentAttendees,
    recentCheckIns: overview.recentCheckIns,
    event: {
      ...eventInfo,
      description: undefined,
      shortDescription: undefined,
      organizer: { id: String(eventLean.organizer), name: org?.businessName, email: org?.email },
    },
    statsLegacy: {
      totalBookings: slimStats.totalSold,
      totalCapacity: slimStats.capacity,
      grossRevenue: slimStats.revenue,
      platformFee: slimStats.platformFee,
      netOrganizer: slimStats.netRevenue,
      checkInRate: slimStats.checkInRate,
      activePromoCodes: slimStats.activePromoCodes,
      ticketsSold: slimStats.totalSold,
    },
  };
}
