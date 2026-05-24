import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { PaymentStatus } from "@/modules/orders/types/order.types.js";

export async function assertOrganizerOwnsEvent(eventId: string, organizerId: string) {
  const event = await Event.findOne({ _id: eventId, organizer: organizerId });
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

export async function listEventAttendees(eventId: string, organizerId: string, search?: string) {
  await assertOrganizerOwnsEvent(eventId, organizerId);

  const orders = await Order.find({
    eventId,
    paymentStatus: PaymentStatus.Paid,
  })
    .sort({ createdAt: -1 })
    .select("orderId guestName guestEmail guestPhone ticketItems customFormResponses createdAt");

  let rows = orders.map((o) => ({
    orderId: o.orderId,
    name: o.guestName,
    email: o.guestEmail,
    phone: o.guestPhone,
    section: o.ticketItems[0]?.sectionTitle ?? "",
    quantity: o.ticketItems.reduce((s, t) => s + t.quantity, 0),
    responses: o.customFormResponses ?? [],
    createdAt: o.createdAt,
  }));

  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q)
    );
  }

  return rows;
}

export function attendeesToCsv(
  rows: Awaited<ReturnType<typeof listEventAttendees>>
): string {
  const fieldKeys = new Set<string>();
  for (const r of rows) {
    for (const resp of r.responses) fieldKeys.add(resp.fieldKey);
  }
  const dynamicCols = [...fieldKeys].sort();
  const header = ["orderId", "name", "email", "phone", "section", "quantity", ...dynamicCols, "createdAt"];
  const lines = [header.join(",")];

  for (const r of rows) {
    const map = Object.fromEntries(r.responses.map((x) => [x.fieldKey, String(x.value)]));
    const base = [
      r.orderId,
      escapeCsv(r.name),
      escapeCsv(r.email),
      escapeCsv(r.phone),
      escapeCsv(r.section),
      String(r.quantity),
    ];
    const dynamic = dynamicCols.map((k) => escapeCsv(map[k] ?? ""));
    lines.push([...base, ...dynamic, r.createdAt.toISOString()].join(","));
  }
  return lines.join("\n");
}

function escapeCsv(v: string) {
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}
