import { Role } from "@/shared/enums/role.enum.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { AuditLog } from "@/modules/audit/models/audit-log.model.js";
import { EventStatus } from "@/modules/events/types/event.types.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import { User } from "@/modules/users/models/user.model.js";

export async function buildActivityFeed(limit = 20) {
  const [users, organizers, events, orders, audits] = await Promise.all([
    User.find({ role: Role.User })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt")
      .lean(),
    Organizer.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("businessName verificationStatus createdAt")
      .lean(),
    Event.find({ status: EventStatus.Live })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("title slug updatedAt")
      .lean(),
    Order.find({ paymentStatus: PaymentStatus.Paid })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("orderId guestName total createdAt paymentStatus")
      .lean(),
    AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("action resource createdAt")
      .lean(),
  ]);

  type FeedItem = {
    id: string;
    type: string;
    message: string;
    href?: string;
    at: string;
  };

  const items: FeedItem[] = [];

  for (const u of users) {
    items.push({
      id: `user-${u._id}`,
      type: "user_registered",
      message: `New user registered: ${u.name}`,
      href: `/admin/users`,
      at: u.createdAt.toISOString(),
    });
  }
  for (const o of organizers) {
    items.push({
      id: `org-${o._id}`,
      type: "organizer_applied",
      message: `Organizer application: ${o.businessName} (${o.verificationStatus})`,
      href: `/admin/organizers`,
      at: o.createdAt.toISOString(),
    });
  }
  for (const e of events) {
    items.push({
      id: `ev-${e._id}`,
      type: "event_published",
      message: `Event live: ${e.title}`,
      href: `/admin/events/${e._id}`,
      at: (e.updatedAt ?? e.createdAt).toISOString(),
    });
  }
  for (const o of orders) {
    items.push({
      id: `ord-${o._id}`,
      type: o.paymentStatus === PaymentStatus.Refunded ? "refund_requested" : "order_placed",
      message:
        o.paymentStatus === PaymentStatus.Refunded
          ? `Refund: ${o.orderId}`
          : `Order ${o.orderId} — ৳${o.total}`,
      href: `/admin/orders`,
      at: o.createdAt.toISOString(),
    });
  }
  for (const a of audits) {
    items.push({
      id: `audit-${a._id}`,
      type: "audit",
      message: `${a.action} on ${a.resource}`,
      at: a.createdAt.toISOString(),
    });
  }

  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}
