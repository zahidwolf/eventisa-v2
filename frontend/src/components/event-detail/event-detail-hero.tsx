"use client";

import { motion } from "framer-motion";
import { CoverImage } from "@/components/media/cover-image";
import type { EventDetail } from "@/types/models/event";
import { formatEventDate } from "@/lib/events/event-utils";

export function EventDetailHero({ event }: { event: EventDetail }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-3xl"
    >
      <div className="relative aspect-[4/3] sm:aspect-[21/9]">
        {event.coverImage ? (
          <CoverImage src={event.coverImage} alt={event.title} fill priority />
        ) : (
          <div className="flex h-full items-center justify-center bg-hero-luxury">
            <span className="font-display text-7xl font-bold text-primary-neon/40">
              {event.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <span className="inline-block rounded-full border border-primary-neon/40 bg-primary-dark/40 px-3 py-1 text-xs font-semibold text-primary-neon backdrop-blur-md">
            {event.category}
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {event.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400 md:text-base">
            {formatEventDate(event.startDate, "long")} · {event.venue.name}, {event.venue.city}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
