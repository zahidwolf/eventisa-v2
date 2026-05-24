import { fetchEvents } from "@/services/events/events.service";
import type { EventListItem } from "@/types/models/event";
import { isThisWeek, isWeekend, isToday } from "@/lib/events/event-utils";

export async function fetchHomeEvents(): Promise<EventListItem[]> {
  try {
    const res = await fetchEvents({ limit: 50 });
    return (res.data.events ?? []) as EventListItem[];
  } catch {
    return [];
  }
}

export function partitionHomeEvents(
  events: EventListItem[],
  curatedFeatured?: EventListItem[],
  curatedTrending?: EventListItem[]
) {
  const featured = curatedFeatured?.length
    ? curatedFeatured.slice(0, 12)
    : events
        .filter((e) => e.featured)
        .sort(
          (a, b) =>
            (b.homepagePriority ?? 0) - (a.homepagePriority ?? 0) ||
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
        .slice(0, 6);
  const trending = curatedTrending?.length
    ? curatedTrending.slice(0, 12)
    : events.filter((e) => e.trending).slice(0, 12);
  const thisWeek = events.filter((e) => isThisWeek(e.startDate));
  const upcoming = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return {
    featured: featured.length ? featured : events.slice(0, 4),
    trending: trending.length ? trending : events.slice(0, 8),
    thisWeek: thisWeek.length ? thisWeek : upcoming.slice(0, 8),
    all: events,
    heroRotation: featured.length ? featured.slice(0, 5) : events.slice(0, 5),
    today: events.filter((e) => isToday(e.startDate)),
    weekend: events.filter((e) => isWeekend(e.startDate)),
  };
}
