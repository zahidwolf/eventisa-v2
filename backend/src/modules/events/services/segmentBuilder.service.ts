import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { SegmentStatus } from "@/modules/events/models/ticket-section.schema.js";
import { EventStatus } from "@/modules/events/types/event.types.js";
import { normalizeSegmentOnSave } from "@/modules/events/utils/segment.util.js";
import { isSegmentPurchasable } from "@/modules/events/utils/segment.util.js";
import {
  fromApiSegment,
  sectionDocId,
  toApiSegment,
} from "@/modules/events/utils/event-builder.mapper.js";
import type { ITicketSegment } from "@/modules/events/models/ticketSegment.model.js";
import type { ITicketSection } from "@/modules/events/models/ticket-section.schema.js";

async function loadEventForOrganizer(eventId: string, userId: string) {
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);

  const event = await Event.findOne({ _id: eventId, organizer: organizer._id });
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

function findSectionIndex(event: Awaited<ReturnType<typeof loadEventForOrganizer>>, segmentId: string) {
  const idx = event.ticketSections.findIndex((s) => sectionDocId(s) === segmentId);
  if (idx < 0) throw new AppError("Segment not found", 404, ErrorCodes.NOT_FOUND);
  return idx;
}

export async function createSegment(
  eventId: string,
  userId: string,
  segmentData: Partial<ITicketSegment>
) {
  try {
    const event = await loadEventForOrganizer(eventId, userId);
    const patch = normalizeSegmentOnSave(fromApiSegment(segmentData));
    if (patch.remainingQuantity == null) patch.remainingQuantity = patch.capacity ?? 100;
    event.ticketSections.push(patch as (typeof event.ticketSections)[0]);
    await event.save();
    const created = event.ticketSections[event.ticketSections.length - 1];
    return toApiSegment(created);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to create segment", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function updateSegment(
  eventId: string,
  userId: string,
  segmentId: string,
  updates: Partial<ITicketSegment>
) {
  try {
    const event = await loadEventForOrganizer(eventId, userId);
    const idx = findSectionIndex(event, segmentId);
    const current = event.ticketSections[idx];
    const currentPlain = JSON.parse(JSON.stringify(current)) as ITicketSection;
    const merged = normalizeSegmentOnSave({
      ...currentPlain,
      ...fromApiSegment(updates),
      segmentId: current.segmentId ?? sectionDocId(current),
    });
    event.ticketSections[idx] = merged as (typeof event.ticketSections)[0];
    event.markModified("ticketSections");
    await event.save();
    return toApiSegment(event.ticketSections[idx]);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to update segment", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function deleteSegment(eventId: string, userId: string, segmentId: string) {
  try {
    const event = await loadEventForOrganizer(eventId, userId);
    const before = event.ticketSections.length;
    event.ticketSections = event.ticketSections.filter((s) => sectionDocId(s) !== segmentId);
    if (event.ticketSections.length === before) {
      throw new AppError("Segment not found", 404, ErrorCodes.NOT_FOUND);
    }
    event.markModified("ticketSections");
    await event.save();
    return { deleted: true };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to delete segment", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function reorderSegments(eventId: string, userId: string, orderedIds: string[]) {
  try {
    const event = await loadEventForOrganizer(eventId, userId);
    const map = new Map(event.ticketSections.map((s) => [sectionDocId(s), s]));
    const reordered = orderedIds.map((id) => {
      const seg = map.get(id);
      if (!seg) throw new AppError(`Unknown segment: ${id}`, 400, ErrorCodes.VALIDATION_ERROR);
      return seg;
    });
    if (reordered.length !== event.ticketSections.length) {
      throw new AppError("orderedIds must include all segments", 400, ErrorCodes.VALIDATION_ERROR);
    }
    event.ticketSections = reordered;
    event.markModified("ticketSections");
    await event.save();
    return event.ticketSections.map(toApiSegment);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to reorder segments", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function forceSegmentStatus(
  eventId: string,
  segmentId: string,
  status: SegmentStatus
) {
  try {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
    const idx = findSectionIndex(event, segmentId);
    event.ticketSections[idx].status = status;
    event.markModified("ticketSections");
    await event.save();
    return toApiSegment(event.ticketSections[idx]);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to override segment status", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function decrementRemaining(eventId: string, segmentId: string, qty: number) {
  try {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
    const idx = findSectionIndex(event, segmentId);
    const section = event.ticketSections[idx];
    const remaining =
      section.remainingQuantity ??
      Math.max(0, section.capacity - (section.quantitySold ?? 0));
    if (remaining < qty) {
      throw new AppError("Insufficient segment inventory", 400, ErrorCodes.VALIDATION_ERROR);
    }
    section.remainingQuantity = remaining - qty;
    section.quantitySold = (section.quantitySold ?? 0) + qty;
    if (section.remainingQuantity <= 0) section.status = SegmentStatus.SoldOut;
    event.markModified("ticketSections");
    await event.save();
    return toApiSegment(section);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to decrement segment inventory", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function checkSegmentAvailability(
  eventId: string,
  segmentId: string,
  qty: number
) {
  try {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
    const section = event.ticketSections.find((s) => sectionDocId(s) === segmentId);
    if (!section) throw new AppError("Segment not found", 404, ErrorCodes.NOT_FOUND);
    const err = isSegmentPurchasable(
      section,
      qty,
      new Date(),
      {
        start: event.registrationStart,
        end: event.registrationEnd,
      },
      event.status as EventStatus
    );
    if (err) throw new AppError(err, 400, ErrorCodes.VALIDATION_ERROR);
    const remaining =
      section.remainingQuantity ??
      Math.max(0, section.capacity - (section.quantitySold ?? 0));
    if (qty > remaining) {
      throw new AppError("Not enough tickets available", 400, ErrorCodes.VALIDATION_ERROR);
    }
    return { available: true, remainingQuantity: remaining };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to check segment availability", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function listSegments(eventId: string, userId: string) {
  try {
    const event = await loadEventForOrganizer(eventId, userId);
    return event.ticketSections.map(toApiSegment);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to list segments", 500, ErrorCodes.INTERNAL_ERROR);
  }
}
