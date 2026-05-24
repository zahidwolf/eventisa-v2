"use client";

import { EventCardGrid } from "@/components/events/cards";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyEvents } from "@/components/empty-states/empty-events";
import type { EventListItem } from "@/types/models/event";

interface EventsGridProps {
  events: EventListItem[];
  isLoading?: boolean;
}

export function EventsGrid({ events, isLoading }: EventsGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!events.length) return <EmptyEvents />;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => (
        <EventCardGrid key={event._id} event={event} index={index} />
      ))}
    </div>
  );
}
