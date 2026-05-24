import { SegmentStatus, type ITicketSection } from "@/modules/events/models/ticket-section.schema.js";
import { EventStatus } from "@/modules/events/types/event.types.js";
import type { EventDocument } from "@/modules/events/models/event.model.js";

type Section = ITicketSection & { _id?: { toString(): string } };

export function getRemainingQuantity(section: Section): number {
  return Math.max(0, section.capacity - (section.quantitySold ?? 0));
}

function earlierDate(a?: Date, b?: Date): Date | undefined {
  if (!a) return b;
  if (!b) return a;
  return a.getTime() <= b.getTime() ? a : b;
}

/**
 * Effective sale window: event registration is the default; segment dates override when earlier.
 * When a segment open time is later than registration, registration wins (stale copied dates).
 */
export function resolveEffectiveSaleWindow(
  section: Section,
  eventRegistration?: { start?: Date; end?: Date }
): { saleStart?: Date; saleEnd?: Date } {
  const regStart = eventRegistration?.start;
  const regEnd = eventRegistration?.end;
  const segStart = section.saleStart;
  const segEnd = section.saleEnd;

  if (!regStart && !regEnd) {
    return { saleStart: segStart, saleEnd: segEnd };
  }

  return {
    saleStart: earlierDate(segStart, regStart),
    saleEnd: earlierDate(segEnd, regEnd),
  };
}

function isSegmentAdministrativelyBlocked(
  section: Section,
  eventStatus?: EventStatus
): boolean {
  if (section.status === SegmentStatus.Hidden) return true;
  if (section.status === SegmentStatus.Draft) {
    // Visible segments on live events remain sellable (draft is a stale builder default).
    return eventStatus !== EventStatus.Live;
  }
  return false;
}

/** Promote visible draft segments and align sale windows when an event is live. */
export function normalizeLiveEventTicketSections(event: EventDocument): boolean {
  if (event.status !== EventStatus.Live) return false;

  let changed = false;
  for (const section of event.ticketSections) {
    if (section.isVisible !== false && section.status === SegmentStatus.Draft) {
      section.status = SegmentStatus.Active;
      changed = true;
    }
    if (event.registrationStart) {
      const regStart = event.registrationStart;
      if (!section.saleStart || section.saleStart > regStart) {
        section.saleStart = regStart;
        changed = true;
      }
    }
    if (event.registrationEnd) {
      const regEnd = event.registrationEnd;
      if (!section.saleEnd || section.saleEnd > regEnd) {
        section.saleEnd = regEnd;
        changed = true;
      }
    }
  }
  if (changed) event.markModified("ticketSections");
  return changed;
}

export function getEffectiveSegmentStatus(
  section: Section,
  now = new Date(),
  eventRegistration?: { start?: Date; end?: Date },
  eventStatus?: EventStatus
): SegmentStatus {
  if (isSegmentAdministrativelyBlocked(section, eventStatus)) {
    return section.status === SegmentStatus.Hidden
      ? SegmentStatus.Hidden
      : SegmentStatus.Draft;
  }
  const { saleStart, saleEnd } = resolveEffectiveSaleWindow(section, eventRegistration);
  if (saleEnd && now > saleEnd) return SegmentStatus.Expired;
  if (saleStart && now < saleStart) return SegmentStatus.Hidden;
  if (getRemainingQuantity(section) <= 0) return SegmentStatus.SoldOut;
  if (section.status === SegmentStatus.Expired) return SegmentStatus.Expired;
  return section.status === SegmentStatus.SoldOut ? SegmentStatus.SoldOut : SegmentStatus.Active;
}

export function isSegmentPurchasable(
  section: Section,
  quantity: number,
  now = new Date(),
  eventRegistration?: { start?: Date; end?: Date },
  eventStatus?: EventStatus
): string | null {
  const status = getEffectiveSegmentStatus(section, now, eventRegistration, eventStatus);
  if (!section.isVisible || status === SegmentStatus.Hidden || status === SegmentStatus.Draft) {
    return "This ticket segment is not available";
  }
  if (status === SegmentStatus.SoldOut) return "This segment is sold out";
  if (status === SegmentStatus.Expired) return "Sales have ended for this segment";
  if (quantity < (section.minPurchase ?? 1)) {
    return `Minimum ${section.minPurchase ?? 1} ticket(s) required`;
  }
  if (quantity > section.maxPurchase) {
    return `Maximum ${section.maxPurchase} tickets per order`;
  }
  if (quantity > getRemainingQuantity(section)) {
    return "Not enough tickets available";
  }
  const { saleStart, saleEnd } = resolveEffectiveSaleWindow(section, eventRegistration);
  if (saleStart && now < saleStart) return "Registration has not opened yet";
  if (saleEnd && now > saleEnd) return "Registration has closed";
  return null;
}

export function normalizeSegmentOnSave<T extends Partial<ITicketSection>>(seg: T): T {
  const next = { ...seg };
  if (next.isFree) next.price = 0;
  if (next.price === 0) next.isFree = true;
  return next;
}
