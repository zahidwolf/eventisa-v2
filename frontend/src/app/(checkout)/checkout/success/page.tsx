"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Download, Printer } from "lucide-react";
import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TicketPass } from "@/components/tickets/ticket-pass";
import { getTicketsByOrder } from "@/services/tickets/tickets.service";
import { useCheckoutStore } from "@/store/checkout.store";
import { downloadDataUrl, printTicketElement } from "@/lib/tickets/download-ticket";
import { trackEvent } from "@/lib/tracking/metaPixel";
import { clearStoredUtmParams } from "@/lib/tracking/utmTracker";
import { routes } from "@/config/routes";
import type { Ticket } from "@/types/models/order";

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const reset = useCheckoutStore((s) => s.reset);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ticketRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("Missing order reference. Check your email or My tickets.");
      return;
    }

    const checkout = useCheckoutStore.getState();
    const checkoutItem = checkout.item;
    const purchaseValue =
      checkout.promoFinalTotal ??
      (checkoutItem
        ? checkoutItem.unitPrice * checkoutItem.quantity + Math.round(checkoutItem.unitPrice * checkoutItem.quantity * 0.05) - checkout.promoDiscount
        : 0);

    getTicketsByOrder(orderId)
      .then((res) => {
        setTickets(res.data.tickets);
        const first = res.data.tickets[0];
        const event = first && typeof first.eventId === "object" ? first.eventId : null;
        const eventId =
          (event && "_id" in event ? String((event as { _id: string })._id) : undefined) ??
          (typeof first?.eventId === "string" ? first.eventId : checkoutItem?.eventId);
        const eventTitle = event?.title ?? checkoutItem?.eventTitle ?? "Event";

        trackEvent("Purchase", {
          content_ids: eventId ? [eventId] : [],
          content_name: eventTitle,
          currency: "BDT",
          value: purchaseValue,
          num_items: res.data.tickets.length || checkoutItem?.quantity || 1,
        });
        clearStoredUtmParams();
      })
      .catch(() => setError("Could not load your tickets. Try again from My tickets."))
      .finally(() => {
        setLoading(false);
        reset();
      });
  }, [orderId, reset]);

  return (
    <Container size="narrow">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-16 text-center"
      >
        <CheckCircle2 className="mx-auto h-16 w-16 text-accent-emerald" />
        <h1 className="mt-6 text-3xl font-bold">You&apos;re in!</h1>
        <p className="mt-2 text-muted-foreground">
          Booking confirmed{orderId ? ` · ${orderId}` : ""}
        </p>

        <div className="mt-8 space-y-6 text-left">
          {loading ? (
            <Skeleton className="mx-auto h-[520px] w-full max-w-md rounded-3xl" />
          ) : error ? (
            <p className="text-center text-sm text-destructive">{error}</p>
          ) : tickets.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No tickets found for this order yet.
            </p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket._id} className="space-y-3">
                <div ref={(el) => { ticketRefs.current[ticket._id] = el; }}>
                  <TicketPass ticket={ticket} />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    onClick={() =>
                      downloadDataUrl(
                        ticket.qrCodeData,
                        `ticket-${ticket.ticketNumber}.png`
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                    Download QR
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 border-white/15"
                    onClick={() => {
                      const el = ticketRefs.current[ticket._id];
                      if (el) printTicketElement(el);
                    }}
                  >
                    <Printer className="h-4 w-4" />
                    Print / Save PDF
                  </Button>
                  <Button variant="ghost" className="gap-2" asChild>
                    <Link href={routes.ticket(ticket._id)}>Open full ticket</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Button className="mt-8" asChild>
          <Link href={routes.events}>Discover more events</Link>
        </Button>
      </motion.div>
    </Container>
  );
}
