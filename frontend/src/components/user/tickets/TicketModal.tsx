"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/events/event-utils";
import { qrDataToImageSrc } from "@/lib/user/qr-code";
import {
  isCancelledTicket,
  shortOrderId,
  venueLabel,
} from "@/lib/user/order-display";
import { fetchUserOrderDetail } from "@/services/user/user-dashboard.service";
import { useAuthStore } from "@/store/auth.store";
import type { UserOrderDetail, UserOrderRow, UserOrderTicket } from "@/types/user-dashboard";

export function TicketModal({
  order,
  onClose,
}: {
  order: UserOrderRow | null;
  onClose: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [ticketIndex, setTicketIndex] = useState(0);
  const [detail, setDetail] = useState<UserOrderDetail | null>(null);
  const [qrSrc, setQrSrc] = useState("");
  const [loadingTickets, setLoadingTickets] = useState(false);

  const cancelled = order
    ? isCancelledTicket(order.paymentStatus ?? order.status, order.orderStatus ?? "")
    : false;
  const tickets: UserOrderTicket[] = detail?.tickets ?? [];
  const qty = tickets.length || order?.quantity || 1;
  const accent = order?.segment.ticketColor ?? "#FF3EA5";
  const activeTicket = tickets[ticketIndex];
  const displayOrder = detail ?? order;

  useEffect(() => {
    if (!order) return;
    setTicketIndex(0);
    setDetail(null);
  }, [order]);

  useEffect(() => {
    if (!order || cancelled) {
      setDetail(null);
      return;
    }

    let cancelledFetch = false;
    setLoadingTickets(true);
    fetchUserOrderDetail(order._id)
      .then((data) => {
        if (!cancelledFetch) setDetail(data);
      })
      .catch(() => {
        if (!cancelledFetch) setDetail(null);
      })
      .finally(() => {
        if (!cancelledFetch) setLoadingTickets(false);
      });

    return () => {
      cancelledFetch = true;
    };
  }, [order, cancelled]);

  useEffect(() => {
    const qrData = activeTicket?.qrData;
    if (!qrData || cancelled) {
      setQrSrc("");
      return;
    }
    let cancelledQr = false;
    qrDataToImageSrc(qrData).then((src) => {
      if (!cancelledQr) setQrSrc(src);
    });
    return () => {
      cancelledQr = true;
    };
  }, [activeTicket?.qrData, cancelled]);

  if (!order || !displayOrder) return null;

  const eventTitle = displayOrder.event.title;
  const organizerName =
    displayOrder.event.organizerName ?? displayOrder.event.organizer?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div
        className="ticket-print-area flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#12121e] sm:rounded-2xl"
        role="dialog"
        aria-modal
      >
        <div className="relative px-6 py-5 text-white" style={{ backgroundColor: accent }}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg bg-black/20 p-1 print:hidden"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Eventisa</p>
          <h2 className="mt-1 pr-8 font-display text-xl font-bold">{eventTitle}</h2>
          {organizerName && <p className="mt-1 text-sm opacity-90">{organizerName}</p>}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6 text-sm text-zinc-300">
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#FF3EA5]" />
            {formatEventDate(displayOrder.event.startDate, "long")}
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3EA5]" />
            <span>
              {venueLabel(displayOrder.event.venue.name)}
              {displayOrder.event.venue.address ? (
                <>
                  <br />
                  <span className="text-zinc-500">{displayOrder.event.venue.address}</span>
                </>
              ) : null}
            </span>
          </p>
          <p>
            <span className="text-zinc-500">Segment:</span>{" "}
            {activeTicket?.sectionTitle ?? displayOrder.segment.name}
          </p>
          <p>
            <span className="text-zinc-500">Ticket holder:</span>{" "}
            {activeTicket?.holderName ?? displayOrder.guestName ?? user?.name ?? "—"}
          </p>
          <p>
            <span className="text-zinc-500">Order ID:</span> #
            {shortOrderId(displayOrder.orderId ?? displayOrder._id)}
          </p>
          {activeTicket?.ticketNumber && (
            <p>
              <span className="text-zinc-500">Ticket #:</span> {activeTicket.ticketNumber}
            </p>
          )}
          <p>
            <span className="text-zinc-500">Quantity:</span> ×{qty}
          </p>

          <div className="relative flex flex-col items-center rounded-xl bg-white p-4">
            {cancelled ? (
              <div className="relative flex h-[250px] w-[250px] items-center justify-center bg-zinc-200">
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rotate-[-12deg] text-2xl font-bold uppercase tracking-widest text-red-500">
                    {(displayOrder.paymentStatus ?? displayOrder.status) === "refunded"
                      ? "Refunded"
                      : "Cancelled"}
                  </span>
                </div>
              </div>
            ) : qrSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrSrc} alt="Ticket QR code" width={250} height={250} />
            ) : (
              <div className="h-[250px] w-[250px] animate-pulse bg-zinc-200" />
            )}
            {!cancelled && !loadingTickets && !qrSrc && (
              <p className="mt-3 text-center text-xs text-red-400">
                Ticket QR unavailable. Open this order from your confirmation email.
              </p>
            )}
            {!cancelled && qrSrc && (
              <p className="mt-3 text-center text-xs text-zinc-600">
                Show this QR code at the entrance
              </p>
            )}
          </div>

          {qty > 1 && !cancelled && (
            <div className="flex items-center justify-center gap-4 print:hidden">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={ticketIndex === 0}
                onClick={() => setTicketIndex((i) => i - 1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-zinc-400">
                Ticket {ticketIndex + 1} of {qty}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={ticketIndex >= qty - 1}
                onClick={() => setTicketIndex((i) => i + 1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-white/10 p-4 print:hidden">
          {!cancelled && (
            <Button className="flex-1" variant="secondary" onClick={() => window.print()}>
              Download Ticket
            </Button>
          )}
          <Button className="flex-1 bg-[#FF3EA5] hover:bg-[#FF3EA5]/90" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
