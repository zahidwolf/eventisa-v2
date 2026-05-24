"use client";

import { motion } from "framer-motion";
import {
  EventCardBadges,
  EventCardImage,
  EventCardLink,
  EventCardMeta,
  WishlistButton,
} from "@/components/events/cards/event-card-shared";
import type { EventListItem } from "@/types/models/event";

interface EventCardFeaturedProps {
  event: EventListItem;
  priority?: boolean;
}

export function EventCardFeatured({ event, priority }: EventCardFeaturedProps) {
  return (
    <EventCardLink event={event}>
      <motion.article
        whileHover={{ scale: 1.01 }}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-surface-card shadow-glow-pink"
      >
        <div className="relative aspect-[21/9] min-h-[220px] md:min-h-[320px]">
          <EventCardImage event={event} className="absolute inset-0" priority={priority} />
          <EventCardBadges event={event} showTrending />
          <WishlistButton />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <h2 className="font-display text-2xl font-bold md:text-4xl">{event.title}</h2>
            <p className="mt-2 max-w-xl text-sm text-zinc-300 md:text-base line-clamp-2">
              {event.shortDescription}
            </p>
            <div className="mt-4 text-white">
              <EventCardMeta event={event} />
            </div>
          </div>
        </div>
      </motion.article>
    </EventCardLink>
  );
}
