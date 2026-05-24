"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { useSegmentCountdown } from "@/components/events/SegmentCountdown";
import { getLowestPrice, isSoldOut } from "@/lib/events/event-utils";
import { resolveSegmentSaleWindow } from "@/lib/events/segment-sale-window";
import { isSegmentFree } from "@/lib/forms/form-field-types";
import { cn } from "@/lib/utils";
import type { EventDetail, TicketSection } from "@/types/models/event";
import { EmptySoldOut } from "@/components/empty-states/empty-sold-out";

interface EventTicketPanelProps {
  event: EventDetail;
  className?: string;
}

function TicketRow({
  event,
  section,
}: {
  event: EventDetail;
  section: TicketSection;
}) {
  const router = useRouter();
  const left = section.capacity - (section.quantitySold ?? 0);
  const free = isSegmentFree(section);
  const { saleStart, saleEnd } = resolveSegmentSaleWindow(section, event);
  const { state, countdown } = useSegmentCountdown({
    saleStart,
    saleEnd,
    status: section.status,
    remainingQuantity: left,
  });

  const isActive = state === "active";
  const buttonLabel =
    state === "upcoming"
      ? countdown
        ? `Sale starts in ${countdown}`
        : "Sale starts soon"
      : state === "soldout"
        ? "Sold Out"
        : state === "expired"
          ? "Sale Ended"
          : free
            ? "Get Free Ticket"
            : `Get ${section.title}`;

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-surface-elevated/80 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{section.title}</p>
          <p className="text-xs text-zinc-500">
            {state === "soldout" ? "Sold out" : state === "expired" ? "Sale ended" : `${left} left`}
          </p>
        </div>
        <p className="text-lg font-bold text-accent-magenta">
          {free ? "Free" : `৳${section.price.toLocaleString()}`}
        </p>
      </div>
      <Button
        className={cn("w-full min-h-11", !isActive && "opacity-60")}
        variant={isActive ? "default" : "secondary"}
        disabled={!isActive}
        onClick={() => {
          if (!isActive) return;
          const q = new URLSearchParams({
            eventId: event._id,
            sectionId: section._id ?? "",
            slug: event.slug,
            title: event.title,
            sectionTitle: section.title,
            price: String(section.price),
            cover: event.coverImage ?? "",
          });
          router.push(`${routes.cart}?${q.toString()}`);
        }}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}

export function EventTicketPanel({ event, className = "" }: EventTicketPanelProps) {
  const visible = event.ticketSections.filter((s) => s.isVisible);
  const lowest = getLowestPrice(event.ticketSections);

  if (isSoldOut(event)) {
    return (
      <Card className={`glass-panel ${className}`}>
        <CardContent className="pt-6">
          <EmptySoldOut compact />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-panel ${className}`}>
      <CardHeader>
        <CardTitle className="font-display text-xl">Tickets</CardTitle>
        {lowest != null && (
          <p className="text-sm text-zinc-500">
            From <span className="font-semibold text-accent-magenta">৳{lowest.toLocaleString()}</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {visible.length ? (
          visible.map((section) => (
            <TicketRow key={section._id ?? section.title} event={event} section={section} />
          ))
        ) : (
          <p className="text-sm text-zinc-500">No tickets available yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
