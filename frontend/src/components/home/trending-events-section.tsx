import { Container } from "@/components/common/container";
import { SectionHeader } from "@/components/home/section-header";
import { EventCardCarousel } from "@/components/events/cards";
import { routes } from "@/config/routes";
import type { EventListItem } from "@/types/models/event";

export function TrendingEventsSection({ events }: { events: EventListItem[] }) {
  if (!events.length) return null;
  return (
    <section className="border-t border-white/[0.06] bg-[#12121e] py-8 md:py-14">
      <Container>
        <SectionHeader
          title="Trending events"
          href={routes.events}
          linkLabel="Explore now"
        />
        <EventCardCarousel events={events.slice(0, 12)} />
      </Container>
    </section>
  );
}
