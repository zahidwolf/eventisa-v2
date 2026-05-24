"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/common/container";
import { Section } from "@/components/common/section";
import { EventDetailHero } from "@/components/event-detail/event-detail-hero";
import { EventTicketPanel } from "@/components/event-detail/event-ticket-panel";
import { EventScheduleSection } from "@/components/event-detail/event-schedule-section";
import { EventSponsorsSection } from "@/components/event-detail/event-sponsors-section";
import { EventUniversityBadge } from "@/components/event-detail/event-university-badge";
import { EventLocationSection } from "@/components/event-detail/event-location-section";
import { EventOrganizerSection } from "@/components/event-detail/event-organizer-section";
import { EventSimilarSection } from "@/components/event-detail/event-similar-section";
import { EventMobileCta } from "@/components/event-detail/event-mobile-cta";
import { EventJsonLd } from "@/components/seo/event-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { EventViewContentTracker } from "@/components/tracking/EventViewContentTracker";
import { routes } from "@/config/routes";
import type { EventDetail } from "@/types/models/event";

export function EventDetailView({ event }: { event: EventDetail }) {
  return (
    <>
      <EventJsonLd event={event} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: routes.home },
          { name: "Events", href: routes.events },
          { name: event.title, href: routes.event(event.slug) },
        ]}
      />
      <EventViewContentTracker event={event} />
      <Section className="pb-28 pt-4 lg:pb-16">
        <Container>
          <Link
            href={routes.events}
            className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-zinc-500 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All events
          </Link>
          <EventDetailHero event={event} />
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
            <div className="space-y-12">
              <EventUniversityBadge university={event.university} />
              <p className="text-lg text-zinc-400">{event.shortDescription}</p>
              <div className="lg:hidden">
                <EventTicketPanel event={event} />
              </div>
              <div className="prose prose-invert max-w-none whitespace-pre-wrap text-zinc-300">
                {event.description}
              </div>
              <EventScheduleSection event={event} />
              <EventSponsorsSection sponsors={event.sponsors ?? []} />
              <EventLocationSection event={event} />
              <EventOrganizerSection event={event} />
              <section className="space-y-3 text-sm text-zinc-500">
                <h2 className="font-display text-xl font-bold text-foreground">Terms</h2>
                <p>
                  Tickets are subject to organizer policies. Entry may require valid ID. Eventisa acts
                  as the ticketing platform; event delivery is the responsibility of the organizer.
                </p>
              </section>
              <EventSimilarSection event={event} />
            </div>
            <div className="hidden lg:block">
              <EventTicketPanel event={event} className="sticky top-24" />
            </div>
          </div>
        </Container>
      </Section>
      <EventMobileCta event={event} />
    </>
  );
}
