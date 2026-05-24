import { Container } from "@/components/common/container";
import { SectionHeader } from "@/components/home/section-header";
import { EventCardCarousel } from "@/components/events/cards";
import { routes } from "@/config/routes";
import type { EventListItem } from "@/types/models/event";

export function FeaturedEventsSection({ events }: { events: EventListItem[] }) {
  if (!events.length) return null;
  return (
    <section className="py-8 md:py-16">
      <Container>
        <SectionHeader title="Featured events" subtitle="Hand-picked experiences" href={routes.events} />
        <EventCardCarousel events={events} />
      </Container>
    </section>
  );
}
