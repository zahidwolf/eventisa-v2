"use client";

import { motion } from "framer-motion";
import { motionTokens } from "@/design-system";
import {
  EventCardBadges,
  EventCardImage,
  EventCardLink,
  EventCardMeta,
  WishlistButton,
} from "@/components/events/cards/event-card-shared";
import type { EventListItem } from "@/types/models/event";

interface EventCardGridProps {
  event: EventListItem;
  index?: number;
}

/** Default grid card — Netflix-style hover */
export function EventCardGrid({ event, index = 0 }: EventCardGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * motionTokens.stagger, duration: motionTokens.duration.normal }}
    >
      <EventCardLink event={event}>
        <article className="card-lift glow-hover overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-card/90">
          <div className="relative aspect-[16/10]">
            <EventCardImage event={event} className="absolute inset-0" />
            <EventCardBadges event={event} showTrending />
            <WishlistButton />
          </div>
          <div className="p-5">
            <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-[#FF3EA5]">
              {event.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{event.shortDescription}</p>
            <EventCardMeta event={event} />
          </div>
        </article>
      </EventCardLink>
    </motion.div>
  );
}
