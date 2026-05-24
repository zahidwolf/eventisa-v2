import { Container } from "@/components/common/container";
import { SectionHeader } from "@/components/home/section-header";
import { EventCardCompact } from "@/components/events/cards";
import { routes } from "@/config/routes";
import type { EventListItem } from "@/types/models/event";

export function UpcomingWeekSection({ events }: { events: EventListItem[] }) {
  if (!events.length) return null;
  return (
    <section className="py-8 md:py-16">
      <Container>
        <SectionHeader title="This week" href={routes.events} />
        <div className="grid gap-3 md:grid-cols-2">
          {events.slice(0, 6).map((e) => (
            <EventCardCompact key={e._id} event={e} />
          ))}
        </div>
      </Container>
    </section>
  );
}
