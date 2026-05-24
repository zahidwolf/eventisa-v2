"use client";

import Link from "next/link";
import { CoverImage } from "@/components/media/cover-image";
import { Calendar, Heart, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { formatEventDate, getEventListPrice, isEventTrending, isSoldOut } from "@/lib/events/event-utils";
import type { EventListItem } from "@/types/models/event";

export function EventCardImage({
  event,
  className,
  priority,
}: {
  event: EventListItem;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-surface-elevated", className)}>
      {event.coverImage ? (
        <CoverImage
          src={event.coverImage}
          alt={event.title}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          className="transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary-neon/25 to-accent-magenta/10">
          <span className="font-display text-5xl font-bold text-primary-neon/30">
            {event.title.charAt(0)}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-surface-base/90 via-transparent to-transparent" />
    </div>
  );
}

export function EventCardBadges({
  event,
  showTrending,
}: {
  event: EventListItem;
  showTrending?: boolean;
}) {
  const soldOut = isSoldOut(event);
  return (
    <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
      <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">
        {event.category}
      </span>
      {showTrending && isEventTrending(event) && (
        <span className="rounded-full bg-accent-hot/90 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
          Trending
        </span>
      )}
      {soldOut && (
        <span className="rounded-full bg-zinc-700 px-2.5 py-1 text-[10px] font-bold uppercase">
          Sold out
        </span>
      )}
    </div>
  );
}

export function WishlistButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Add to wishlist"
      className={cn(
        "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full",
        "bg-black/50 text-white backdrop-blur transition hover:bg-primary-neon/80",
        className
      )}
      onClick={(e) => e.preventDefault()}
    >
      <Heart className="h-4 w-4" />
    </button>
  );
}

export function EventCardMeta({ event }: { event: EventListItem }) {
  const price = getEventListPrice(event);
  return (
    <>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-400">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-primary-neon" />
          {formatEventDate(event.startDate, "weekday")}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-primary-neon" />
          {event.city}
        </span>
      </div>
      {price !== null && (
        <p className="mt-2 text-sm text-zinc-400">
          From <span className="text-lg font-bold text-gold">৳{price.toLocaleString()}</span>
        </p>
      )}
    </>
  );
}

export function EventCardLink({ event, children, className }: {
  event: EventListItem;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={routes.event(event.slug)} className={cn("group block", className)}>
      {children}
    </Link>
  );
}
