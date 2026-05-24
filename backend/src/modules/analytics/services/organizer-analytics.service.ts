import mongoose from "mongoose";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Ticket } from "@/modules/tickets/models/ticket.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { TicketStatus } from "@/modules/tickets/types/ticket.types.js";

export async function getOrganizerAnalytics(userId: string, eventId?: string) {
  const org = await Organizer.findOne({ userId });
  if (!org) throw new AppError("Organizer required", 403, ErrorCodes.FORBIDDEN);

  const filter: Record<string, unknown> = { organizer: org._id };
  if (eventId) filter._id = new mongoose.Types.ObjectId(eventId);

  const events = await Event.find(filter).select("title ticketSections");
  const eventIds = events.map((e) => e._id);
  const paid = await Order.find({ eventId: { $in: eventIds }, paymentStatus: PaymentStatus.Paid });

  const ticketsSold = paid.reduce((s, o) => s + o.ticketItems.reduce((n, i) => n + i.quantity, 0), 0);
  const revenue = paid.reduce((s, o) => s + (o.total ?? 0), 0);
  const [checkedIn, totalTickets] = await Promise.all([
    Ticket.countDocuments({ eventId: { $in: eventIds }, status: TicketStatus.Used }),
    Ticket.countDocuments({ eventId: { $in: eventIds } }),
  ]);

  const sections = new Map<string, { title: string; sold: number; revenue: number }>();
  for (const o of paid) {
    for (const item of o.ticketItems) {
      const p = sections.get(item.sectionId) ?? { title: item.sectionTitle, sold: 0, revenue: 0 };
      p.sold += item.quantity;
      p.revenue += item.unitPrice * item.quantity;
      sections.set(item.sectionId, p);
    }
  }

  const started = await Order.countDocuments({ eventId: { $in: eventIds } });

  return {
    summary: {
      ticketsSold,
      revenue,
      attendance: checkedIn,
      totalTickets,
      attendanceRate: totalTickets ? checkedIn / totalTickets : 0,
      conversionRate: started ? paid.length / started : 0,
      eventCount: events.length,
    },
    popularSections: [...sections.values()].sort((a, b) => b.sold - a.sold).slice(0, 8),
    checkIn: { checkedIn, unused: totalTickets - checkedIn },
  };
}
