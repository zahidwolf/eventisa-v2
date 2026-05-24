"use client";

import { CoverImage } from "@/components/media/cover-image";
import { Button } from "@/components/ui/button";
import { formatOrderDate, formatBdt, orderStatusLabel } from "@/lib/user/order-display";
import type { UserOrderRow } from "@/types/user-dashboard";

export function OrderCard({
  order,
  onView,
}: {
  order: UserOrderRow;
  onView: () => void;
}) {
  const badge = orderStatusLabel(order.paymentStatus, order.orderStatus);

  return (
    <article className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
        {order.event.bannerImage ? (
          <CoverImage src={order.event.bannerImage} alt="" fill sizes="96px" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-medium text-white">{order.event.title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">{formatOrderDate(order.createdAt)}</p>
        <p className="text-xs text-zinc-600">
          {order.segment.name}
          {order.quantity > 1 ? ` ×${order.quantity}` : ""}
        </p>
        <p className="mt-1 text-sm font-semibold text-white">{formatBdt(order.totalAmount)}</p>
      </div>
      <Button size="sm" variant="secondary" className="shrink-0 self-center" onClick={onView}>
        View Details
      </Button>
    </article>
  );
}
