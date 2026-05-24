import { AttendeeSubmission } from "@/modules/events/models/attendeeSubmission.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";
import type { EventDocument } from "@/modules/events/models/event.model.js";
import { sectionDocId } from "@/modules/events/utils/event-builder.mapper.js";
import { segmentMeta } from "@/modules/events/utils/attendee-row.util.js";

/** Count unique registrations (by orderId) per segment — avoids double-counting submissions + orders. */
export async function getSegmentCountsForEvent(event: EventDocument) {
  const bySegment = new Map<string, Set<string>>();

  const add = (segmentRef: string, orderId: string) => {
    if (!orderId) return;
    const { segmentId } = segmentMeta(event, segmentRef);
    const set = bySegment.get(segmentId) ?? new Set<string>();
    set.add(orderId);
    bySegment.set(segmentId, set);
  };

  const [submissions, paidOrders] = await Promise.all([
    AttendeeSubmission.find({ eventId: event._id }).select("orderId segmentId").lean(),
    Order.find({ eventId: event._id, paymentStatus: PaymentStatus.Paid })
      .select("orderId ticketItems")
      .lean(),
  ]);

  for (const sub of submissions) {
    add(sub.segmentId, sub.orderId);
  }
  for (const order of paidOrders) {
    const sectionId = order.ticketItems[0]?.sectionId;
    if (sectionId) add(sectionId, order.orderId);
  }

  return event.ticketSections.map((s) => {
    const id = sectionDocId(s);
    return {
      segmentId: id,
      name: s.name ?? s.title,
      color: s.ticketColor,
      count: bySegment.get(id)?.size ?? 0,
    };
  });
}
