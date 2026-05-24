import type { EventListItem } from "@/types/models/event";
import { getEventListPrice, isEventTrending, isToday, isWeekend } from "@/lib/events/event-utils";

export type SortOption = "popular" | "latest" | "price-asc" | "price-desc";

export interface EventFilters {
  city?: string;
  category?: string;
  date?: string;
  priceMin?: number;
  priceMax?: number;
  freeOnly?: boolean;
  today?: boolean;
  weekend?: boolean;
  trending?: boolean;
  q?: string;
}

export function filterAndSortEvents(events: EventListItem[], filters: EventFilters, sort: SortOption) {
  let list = [...events];

  if (filters.city) list = list.filter((e) => e.city === filters.city);
  if (filters.category) list = list.filter((e) => e.category === filters.category);
  if (filters.today) list = list.filter((e) => isToday(e.startDate));
  if (filters.weekend) list = list.filter((e) => isWeekend(e.startDate));
  if (filters.trending) list = list.filter((e) => isEventTrending(e));
  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.shortDescription?.toLowerCase().includes(q) ?? false) ||
        e.city.toLowerCase().includes(q)
    );
  }
  if (filters.freeOnly) list = list.filter((e) => getEventListPrice(e) === 0);
  if (filters.priceMin != null) {
    list = list.filter((e) => {
      const p = getEventListPrice(e);
      return p != null && p >= filters.priceMin!;
    });
  }
  if (filters.priceMax != null) {
    list = list.filter((e) => {
      const p = getEventListPrice(e);
      return p != null && p <= filters.priceMax!;
    });
  }
  if (filters.date) {
    const d = filters.date;
    list = list.filter((e) => e.startDate.slice(0, 10) === d);
  }

  switch (sort) {
    case "price-asc":
      list.sort((a, b) => (getEventListPrice(a) ?? 0) - (getEventListPrice(b) ?? 0));
      break;
    case "price-desc":
      list.sort((a, b) => (getEventListPrice(b) ?? 0) - (getEventListPrice(a) ?? 0));
      break;
    case "latest":
      list.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      break;
    default:
      list.sort((a, b) => (isEventTrending(b) ? 1 : 0) - (isEventTrending(a) ? 1 : 0));
  }

  return list;
}
