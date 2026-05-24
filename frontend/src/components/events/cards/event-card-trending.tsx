"use client";

import Link from "next/link";
import { CoverImage } from "@/components/media/cover-image";
import { MapPin } from "lucide-react";
import { routes } from "@/config/routes";
import {
  formatEventDateBadge,
  getEventListPrice,
  isSoldOut,
} from "@/lib/events/event-utils";
import type { EventListItem } from "@/types/models/event";

interface EventCardTrendingProps {
  event: EventListItem;
}

/** Vertical card — EVENTIX trending row style */
export function EventCardTrending({ event }: EventCardTrendingProps) {
  const { day, month } = formatEventDateBadge(event.startDate);
  const price = getEventListPrice(event);
  const soldOut = isSoldOut(event);

  return (
    <Link
      href={routes.event(event.slug)}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-surface-card"
    >
      <div className="relative aspect-[7/8] overflow-hidden bg-surface-elevated">
        {event.coverImage ? (
          <CoverImage
            src={event.coverImage}
            alt={event.title}
            fill
            className="transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 85vw, 320px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#151B31] to-[#9B5CFF]/20">
            <span className="font-display text-4xl font-bold text-white/20">
              {event.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12121e]/90 via-transparent to-transparent" />
        <div className="absolute left-2.5 top-2.5 flex flex-col items-center rounded-lg bg-black/70 px-2 py-1 text-center backdrop-blur-sm">
          <span className="text-base font-bold leading-none text-white">{day}</span>
          <span className="text-[10px] font-semibold tracking-wider text-[#FF3EA5]">{month}</span>
        </div>
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-md bg-zinc-800/90 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-300">
            Sold out
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-2.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-white group-hover:text-[#FF3EA5]">
          {event.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">
            {event.venue?.name ? `${event.venue.name}, ` : ""}
            {event.city}
          </span>
        </p>
        {price !== null && (
          <p className="mt-auto pt-1.5 text-sm font-bold text-[#FF3EA5]">
            ৳ {price.toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
}
