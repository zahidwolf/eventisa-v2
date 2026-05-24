import type { EventListItem, TicketSection } from "@/types/models/event";

function toMs(value?: string | Date | null): number | null {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  const ms = d.getTime();
  return Number.isNaN(ms) ? null : ms;
}

/** True when two datetimes are the same within one minute (datetime-local rounding). */
export function saleDatesMatch(a?: string | Date | null, b?: string | Date | null): boolean {
  const ams = toMs(a);
  const bms = toMs(b);
  if (ams == null || bms == null) return false;
  return Math.abs(ams - bms) < 60_000;
}

export interface SegmentSaleWindow {
  saleStart: string | null;
  saleEnd: string | null;
}

function earlierStart(a?: string | null, b?: string | null): string | null {
  const ams = toMs(a);
  const bms = toMs(b);
  if (ams == null) return b ?? null;
  if (bms == null) return a ?? null;
  return ams <= bms ? a! : b!;
}

function earlierEnd(a?: string | null, b?: string | null): string | null {
  const ams = toMs(a);
  const bms = toMs(b);
  if (ams == null) return b ?? null;
  if (bms == null) return a ?? null;
  return ams <= bms ? a! : b!;
}

/**
 * Effective ticket sale window for a segment.
 * Event registration is the default; segment fields override when earlier (early access)
 * or when registration is unset. When a segment open time is later than registration,
 * registration wins (stale copied dates from an old registration window).
 */
export function resolveSegmentSaleWindow(
  section: TicketSection,
  event: Pick<EventListItem, "registrationStart" | "registrationEnd">
): SegmentSaleWindow {
  const regStart = event.registrationStart ?? null;
  const regEnd = event.registrationEnd ?? null;
  const segStart = section.saleStart ?? null;
  const segEnd = section.saleEnd ?? null;

  if (!regStart && !regEnd) {
    return { saleStart: segStart, saleEnd: segEnd };
  }

  return {
    saleStart: earlierStart(segStart, regStart),
    saleEnd: earlierEnd(segEnd, regEnd),
  };
}

/** Drop segment sale times that only mirrored the event registration window. */
export function stripInheritedSegmentSaleTimes(
  section: TicketSection,
  registrationStart?: string,
  registrationEnd?: string
): TicketSection {
  const next = { ...section };
  if (
    registrationStart &&
    next.saleStart &&
    saleDatesMatch(next.saleStart, registrationStart)
  ) {
    next.saleStart = undefined;
  }
  if (registrationEnd && next.saleEnd && saleDatesMatch(next.saleEnd, registrationEnd)) {
    next.saleEnd = undefined;
  }
  return next;
}
