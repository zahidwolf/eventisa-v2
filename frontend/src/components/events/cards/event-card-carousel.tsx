"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCardGrid } from "@/components/events/cards/event-card-grid";
import type { EventListItem } from "@/types/models/event";

interface EventCarouselProps {
  events: EventListItem[];
  title?: string;
}

export function EventCardCarousel({ events, title }: EventCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  if (!events.length) return null;

  return (
    <div>
      {title && <h2 className="mb-6 font-display text-2xl font-semibold md:text-3xl">{title}</h2>}
      <div className="relative">
        <div
          ref={scrollRef}
          className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:gap-6"
        >
          {events.map((event, i) => (
            <div key={event._id} className="w-[85vw] shrink-0 snap-start sm:w-[320px]">
              <EventCardGrid event={event} index={i} />
            </div>
          ))}
        </div>
        <Button
          variant="secondary"
          size="icon"
          className="absolute -left-2 top-1/2 hidden -translate-y-1/2 md:flex"
          onClick={() => scroll(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute -right-2 top-1/2 hidden -translate-y-1/2 md:flex"
          onClick={() => scroll(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
