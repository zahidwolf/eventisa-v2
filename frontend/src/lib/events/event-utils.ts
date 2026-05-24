import type { EventListItem, TicketSection } from "@/types/models/event";
import { env } from "@/config/env";

/** Date badge for event cards — e.g. "25" + "MAY" */
export function formatEventDateBadge(date: string) {
  const d = new Date(date);
  const day = d.getDate().toString();
  const month = new Intl.DateTimeFormat(env.locale, {
    month: "short",
    timeZone: env.timezone,
  })
    .format(d)
    .toUpperCase();
  return { day, month };
}

export function formatEventDate(date: string, style: "short" | "long" | "weekday" = "short") {
  const opts: Intl.DateTimeFormatOptions =
    style === "long"
      ? { dateStyle: "full", timeStyle: "short", timeZone: env.timezone }
      : style === "weekday"
        ? { weekday: "short", day: "numeric", month: "short", timeZone: env.timezone }
        : { day: "numeric", month: "short", year: "numeric", timeZone: env.timezone };
  return new Intl.DateTimeFormat(env.locale, opts).format(new Date(date));
}

export function getLowestPrice(sections: TicketSection[]): number | null {
  const visible = sections.filter((s) => s.isVisible);
  if (!visible.length) return null;
  return Math.min(...visible.map((s) => s.price));
}

/** List/summary endpoints may expose minPrice instead of full ticketSections. */
export function getEventListPrice(event: EventListItem): number | null {
  if (event.minPrice != null) return event.minPrice;
  if (event.ticketSections?.length) return getLowestPrice(event.ticketSections);
  return null;
}

export function isSoldOut(event: EventListItem): boolean {
  if (event.remainingCapacity != null) return event.remainingCapacity <= 0;
  const sections = event.ticketSections;
  if (!sections?.length) return false;
  const visible = sections.filter((s) => s.isVisible);
  if (!visible.length) return true;
  return visible.every((s) => s.quantitySold >= s.capacity);
}

export function isEventTrending(event: EventListItem): boolean {
  return Boolean(event.isTrending ?? event.trending);
}

export function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);
  return d >= now && d <= weekEnd;
}

export function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr).getDay();
  return day === 5 || day === 6;
}

export function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export const BD_CITIES = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
] as const;

export { EVENT_CATEGORY_LABELS as EVENT_CATEGORIES } from "@/lib/categories/event-categories";
