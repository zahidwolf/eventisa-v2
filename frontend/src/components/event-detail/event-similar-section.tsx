"use client";

import { useQuery } from "@tanstack/react-query";
import { EventsGrid } from "@/components/events/events-grid";
import { fetchEvents } from "@/services/events/events.service";
import type { EventDetail } from "@/types/models/event";

export function EventSimilarSection({ event }: { event: EventDetail }) {
  const { data, isLoading } = useQuery({
    queryKey: ["similar-events", event.category, event._id],
    queryFn: () => fetchEvents({ category: event.category, limit: 8 }),
  });

  const similar = (data?.data.events ?? []).filter((e) => e._id !== event._id).slice(0, 4);

  if (!isLoading && !similar.length) return null;

  return (
    <section className="space-y-6 border-t border-white/10 pt-12">
      <h2 className="font-display text-2xl font-bold">Similar events</h2>
      <EventsGrid events={similar} isLoading={isLoading} />
    </section>
  );
}
