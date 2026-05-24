"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { CoverImage } from "@/components/media/cover-image";
import { Button } from "@/components/ui/button";
import { TicketModal } from "@/components/user/tickets/TicketModal";
import { formatEventDate } from "@/lib/events/event-utils";
import {
  formatBdt,
  formatOrderDate,
  orderStatusLabel,
  shortOrderId,
  venueLabel,
} from "@/lib/user/order-display";
import { fetchUserOrderDetail } from "@/services/user/user-dashboard.service";
import { USER_ORDER_DETAIL_STALE_MS } from "@/lib/buyer-query";
import type { UserOrderDetail } from "@/types/user-dashboard";

export function OrderDetailDrawer({
  orderId,
  onClose,
}: {
  orderId: string | null;
  onClose: () => void;
}) {
  const [ticketOpen, setTicketOpen] = useState<UserOrderDetail | null>(null);

  const { data: order, isLoading } = useQuery({
    queryKey: ["user-order-detail", orderId],
    queryFn: () => fetchUserOrderDetail(orderId!),
    enabled: !!orderId,
    staleTime: USER_ORDER_DETAIL_STALE_MS,
  });

  if (!orderId) return null;

  const badge = order
    ? orderStatusLabel(order.paymentStatus ?? order.status, order.orderStatus ?? "")
    : { label: "", className: "" };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-gradient-to-b from-[#12121e] to-[#070B1A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">
              Order #{shortOrderId(order?.orderId ?? orderId)}
            </h2>
            {order && (
              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 text-sm">
          {isLoading && <p className="text-zinc-500">Loading order…</p>}
          {order && (
            <div className="space-y-6">
              <section className="flex gap-3">
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                  {order.event.bannerImage ?? order.event.coverImage ? (
                    <CoverImage
                      src={(order.event.bannerImage ?? order.event.coverImage)!}
                      alt=""
                      fill
                      sizes="96px"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="font-medium text-white">{order.event.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatEventDate(order.event.startDate, "long")}
                  </p>
                  <p className="text-xs text-zinc-600">{venueLabel(order.event.venue.name)}</p>
                  <Link
                    href={`/event/${order.event.slug}`}
                    className="mt-2 inline-block text-xs text-[#FF3EA5] hover:underline"
                  >
                    View Event
                  </Link>
                </div>
              </section>

              <section className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
                <Row label="Segment" value={order.segment.name} />
                <Row label="Quantity" value={String(order.quantity)} />
                <Row label="Unit price" value={formatBdt(order.segment.price)} />
                <Row label="Subtotal" value={formatBdt(order.subtotal)} />
                <Row label="Service fee" value={formatBdt(order.serviceFee)} />
                {order.discountAmount > 0 && (
                  <Row label="Discount" value={`-${formatBdt(order.discountAmount)}`} />
                )}
                {order.promoCode && <Row label="Promo code" value={order.promoCode} />}
                <p className="flex justify-between border-t border-white/10 pt-2 font-semibold text-white">
                  <span>Total</span>
                  <span>{formatBdt(order.totalAmount)}</span>
                </p>
                {order.paymentMethod && (
                  <Row label="Payment method" value={order.paymentMethod} />
                )}
                <Row label="Order date" value={formatOrderDate(order.createdAt)} />
              </section>

              {order.paymentStatus === "paid" || order.status === "paid" ? (
                <Button
                  className="w-full bg-[#FF3EA5] hover:bg-[#FF3EA5]/90"
                  onClick={() => setTicketOpen(order)}
                >
                  View QR Tickets
                </Button>
              ) : null}

              <p className="text-center text-xs text-zinc-500">
                <a
                  href="mailto:eventisa.contact@gmail.com"
                  className="text-[#FF3EA5] hover:underline"
                >
                  Need help? Contact support
                </a>
              </p>
            </div>
          )}
        </div>
      </aside>

      <TicketModal order={ticketOpen} onClose={() => setTicketOpen(null)} />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-4 text-zinc-400">
      <span>{label}</span>
      <span className="text-right text-white">{value}</span>
    </p>
  );
}
