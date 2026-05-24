"use client";

import { CoverImage } from "@/components/media/cover-image";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/events/event-utils";
import { orderStatusLabel, venueLabel } from "@/lib/user/order-display";
import type { UserOrderRow } from "@/types/user-dashboard";

export function TicketCard({
  order,
  onView,
}: {
  order: UserOrderRow;
  onView: () => void;
}) {
  const badge = orderStatusLabel(order.paymentStatus, order.orderStatus);

  return (
    <article className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
        {order.event.bannerImage ? (
          <CoverImage src={order.event.bannerImage} alt="" fill sizes="112px" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-medium text-white">{order.event.title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">{formatEventDate(order.event.startDate, "long")}</p>
        <p className="text-xs text-zinc-600">
          {venueLabel(order.event.venue.name)}
          {order.event.venue.address ? ` · ${order.event.venue.address}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: `${order.segment.ticketColor}33`, color: order.segment.ticketColor }}
          >
            {order.segment.name}
            {order.quantity > 1 ? ` ×${order.quantity}` : ""}
          </span>
        </div>
      </div>
      <Button size="sm" className="shrink-0 self-center" onClick={onView}>
        View Ticket
      </Button>
    </article>
  );
}
