"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { getLowestPrice, isSoldOut } from "@/lib/events/event-utils";
import type { EventDetail } from "@/types/models/event";

export function EventMobileCta({ event }: { event: EventDetail }) {
  const router = useRouter();
  const lowest = getLowestPrice(event.ticketSections);
  const soldOut = isSoldOut(event);
  const firstSection = event.ticketSections.find((s) => s.isVisible && s.quantitySold < s.capacity);

  const goTickets = () => {
    if (!firstSection) return;
    const q = new URLSearchParams({
      eventId: event._id,
      sectionId: firstSection._id ?? "",
      slug: event.slug,
      title: event.title,
      sectionTitle: firstSection.title,
      price: String(firstSection.price),
      cover: event.coverImage ?? "",
    });
    router.push(`${routes.cart}?${q.toString()}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-surface/95 p-4 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500">From</p>
          <p className="text-lg font-bold text-accent-magenta">
            {soldOut ? "Sold out" : lowest != null ? `৳${lowest.toLocaleString()}` : "—"}
          </p>
        </div>
        <Button className="min-h-12 flex-1 max-w-[200px]" disabled={soldOut} onClick={goTickets}>
          {soldOut ? "Sold out" : "Get tickets"}
        </Button>
      </div>
    </div>
  );
}
