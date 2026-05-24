import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { EventStatus } from "@/modules/events/types/event.types.js";

export async function getAdminAnalytics() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const paid = await Order.find({ paymentStatus: PaymentStatus.Paid });
  const revenue = paid.reduce((s, o) => s + (o.total ?? 0), 0);
  const ticketsSold = paid.reduce((s, o) => s + o.ticketItems.reduce((n, i) => n + i.quantity, 0), 0);
  const growthOrders30d = await Order.countDocuments({
    paymentStatus: PaymentStatus.Paid,
    createdAt: { $gte: since },
  });

  const byEvent = new Map<string, { title: string; revenue: number; sold: number }>();
  for (const o of paid) {
    const id = o.eventId.toString();
    const e = await Event.findById(id).select("title");
    const row = byEvent.get(id) ?? { title: e?.title ?? "Event", revenue: 0, sold: 0 };
    row.revenue += o.total ?? 0;
    row.sold += o.ticketItems.reduce((n, i) => n + i.quantity, 0);
    byEvent.set(id, row);
  }

  const topOrganizers = await Event.aggregate([
    { $match: { status: EventStatus.Live } },
    { $group: { _id: "$organizer", events: { $sum: 1 } } },
    { $sort: { events: -1 } },
    { $limit: 10 },
  ]);

  return {
    summary: {
      platformRevenue: revenue,
      ticketsSold,
      totalEvents: await Event.countDocuments(),
      liveEvents: await Event.countDocuments({ status: EventStatus.Live }),
      totalOrganizers: await Organizer.countDocuments({ verificationStatus: "approved" }),
      growthOrders30d,
    },
    topEvents: [...byEvent.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    topOrganizers,
  };
}
