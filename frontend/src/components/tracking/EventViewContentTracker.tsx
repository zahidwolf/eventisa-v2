"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/tracking/metaPixel";
import { getLowestPrice } from "@/lib/events/event-utils";
import type { EventDetail } from "@/types/models/event";

export function EventViewContentTracker({ event }: { event: EventDetail }) {
  useEffect(() => {
    const minPrice = getLowestPrice(event.ticketSections) ?? 0;
    trackEvent("ViewContent", {
      content_ids: [event._id],
      content_name: event.title,
      content_category: event.category,
      currency: "BDT",
      value: minPrice,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per event view
  }, [event._id]);

  return null;
}
