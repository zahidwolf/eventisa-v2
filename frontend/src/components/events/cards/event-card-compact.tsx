"use client";

import {
  EventCardLink,
  EventCardMeta,
} from "@/components/events/cards/event-card-shared";
import { CoverImage } from "@/components/media/cover-image";
import type { EventListItem } from "@/types/models/event";

export function EventCardCompact({ event }: { event: EventListItem }) {
  return (
    <EventCardLink event={event}>
      <article className="flex gap-4 rounded-xl border border-white/[0.08] bg-surface-card/80 p-3 card-lift">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
          {event.coverImage ? (
            <CoverImage src={event.coverImage} alt="" fill sizes="80px" />
          ) : (
            <div className="h-full w-full bg-primary-neon/20" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold">{event.title}</h4>
          <EventCardMeta event={event} />
        </div>
      </article>
    </EventCardLink>
  );
}
