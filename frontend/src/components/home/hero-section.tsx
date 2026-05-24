"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShieldCheck, Sparkles, Ticket, Zap } from "lucide-react";
import { Container } from "@/components/common/container";
import { CoverImage } from "@/components/media/cover-image";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { formatEventDate } from "@/lib/events/event-utils";
import { resolveUploadUrl } from "@/lib/media/resolve-upload-url";
import { cn } from "@/lib/utils";
import type { EventListItem } from "@/types/models/event";

const AUTO_PLAY_MS = 5000;
const TRANSITION_MS = 700;

const TRUST_ITEMS = [
  { icon: Ticket, label: "Easy Booking" },
  { icon: ShieldCheck, label: "Secure Payment" },
  { icon: Zap, label: "Instant Tickets" },
  { icon: Sparkles, label: "Best Events" },
] as const;

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1920&q=80";

const FALLBACK = {
  title: "Discover best events",
  highlight: "experiences",
  subtitle:
    "Concerts, conferences, festivals, sports & more across Bangladesh — book trusted tickets in seconds.",
};

function getEventBannerImage(event: EventListItem): string | undefined {
  return event.bannerImage ?? event.coverImage;
}

function getEventLocation(event: EventListItem): string {
  if (event.venue?.name) {
    const parts = [event.venue.name, event.venue.city || event.city].filter(Boolean);
    return parts.join(", ");
  }
  return event.city;
}

interface HeroSectionProps {
  events?: EventListItem[];
}

export function HeroSection({ events = [] }: HeroSectionProps) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const eventSlides = events.filter((e) => Boolean(getEventBannerImage(e)?.trim()));
  const useCarousel = eventSlides.length > 0;

  const goTo = useCallback(
    (index: number) => {
      if (!eventSlides.length) return;
      setSlide(((index % eventSlides.length) + eventSlides.length) % eventSlides.length);
    },
    [eventSlides.length],
  );

  const next = useCallback(() => goTo(slide + 1), [goTo, slide]);
  const prev = useCallback(() => goTo(slide - 1), [goTo, slide]);

  useEffect(() => {
    setSlide(0);
  }, [eventSlides.length]);

  useEffect(() => {
    if (!useCarousel || eventSlides.length < 2 || paused) return;
    const timer = setInterval(() => {
      setSlide((s) => (s + 1) % eventSlides.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [useCarousel, eventSlides.length, paused]);

  const activeEvent = useCarousel ? eventSlides[slide] : undefined;
  const bgImage = activeEvent
    ? resolveUploadUrl(getEventBannerImage(activeEvent)!)
    : FALLBACK_IMAGE;

  const titleParts = FALLBACK.title.split(" ");
  const titleLead = titleParts.slice(0, -1).join(" ");
  const highlightWord = FALLBACK.highlight;

  return (
    <section
      className="relative min-h-[520px] overflow-hidden md:min-h-[580px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {useCarousel ? (
        <>
          {eventSlides.map((event, i) => {
            const src = resolveUploadUrl(getEventBannerImage(event)!);
            return (
              <div
                key={event._id}
                className={cn(
                  "absolute inset-0 transition-opacity ease-in-out",
                  i === slide ? "z-10 opacity-100" : "z-0 opacity-0",
                )}
                style={{ transitionDuration: `${TRANSITION_MS}ms` }}
                aria-hidden={i !== slide}
              >
                <CoverImage
                  src={src}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            );
          })}
        </>
      ) : (
        <CoverImage src={bgImage} alt="" fill priority sizes="100vw" className="object-cover" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#12121e] via-[#12121e]/75 to-[#12121e]/35" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,45,85,0.12),transparent_55%)]" />

      {useCarousel && eventSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-sm transition hover:border-[#FF3EA5]/50 hover:bg-black/55 hover:text-[#FF3EA5] sm:flex md:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 p-2.5 text-white backdrop-blur-sm transition hover:border-[#FF3EA5]/50 hover:bg-black/55 hover:text-[#FF3EA5] sm:flex md:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <Container className="relative z-10 flex min-h-[460px] flex-col justify-center py-10 pb-20 md:min-h-[520px] md:py-16 md:pb-28">
        <div className={cn("max-w-3xl", useCarousel ? "text-left" : "mx-auto text-center")}>
          {useCarousel && activeEvent ? (
            <>
              <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                {activeEvent.title}
              </h1>
              <p className="mt-3 text-sm text-zinc-300 md:text-base">
                {formatEventDate(activeEvent.startDate, "long")}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{getEventLocation(activeEvent)}</p>
              <Button className="mt-6 shadow-glow-pink" asChild>
                <Link href={routes.event(activeEvent.slug)}>Get Tickets</Link>
              </Button>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold uppercase leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl md:text-center">
                {titleLead}{" "}
                <span className="text-[#FF3EA5]">{highlightWord}</span>
              </h1>
              <p className="mt-5 text-sm text-zinc-400 md:text-base md:mx-auto md:max-w-2xl">
                {FALLBACK.subtitle}
              </p>
            </>
          )}
        </div>

        {useCarousel && eventSlides.length > 1 && (
          <div className="mt-8 flex justify-center gap-2 sm:justify-start">
            {eventSlides.map((event, i) => (
              <button
                key={event._id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === slide ? "true" : undefined}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === slide ? "w-6 bg-[#FF3EA5]" : "w-2.5 bg-zinc-500/80 hover:bg-zinc-400",
                )}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}

      </Container>

      <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/[0.06] bg-[#12121e]/50 py-4 backdrop-blur-sm md:py-5">
        <Container>
          <ul className="flex flex-nowrap items-center justify-center gap-2 sm:gap-4 md:gap-8 lg:gap-10">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[10px] text-zinc-400 sm:gap-2 sm:text-xs md:text-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#FF3EA5] sm:h-8 sm:w-8">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </section>
  );
}
