import {
  aggregateAdminEventList,
  type AdminEventListQuery,
} from "@/modules/events/services/admin-event-list.service.js";
import { aggregateAdminPendingEvents } from "@/modules/events/services/admin-event-pending.service.js";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Event } from "@/modules/events/models/event.model.js";
import { invalidatePublicEventCaches } from "@/modules/events/utils/event-cache.util.js";
import {
  EventApprovalStatus,
  EventStatus,
} from "@/modules/events/types/event.types.js";
import { SegmentStatus } from "@/modules/events/models/ticket-section.schema.js";
import { findTicketSection } from "@/modules/events/utils/section.util.js";
import { normalizeLiveEventTicketSections } from "@/modules/events/utils/segment.util.js";

export async function listPendingEvents() {
  return aggregateAdminPendingEvents();
}

export async function listAllEventsForAdmin(query?: AdminEventListQuery) {
  return aggregateAdminEventList(query ?? { page: 1, limit: 20 });
}

export async function listEventsForAdminFiltered(query: AdminEventListQuery) {
  return aggregateAdminEventList(query);
}

export async function unpublishEventAdmin(eventId: string) {
  const event = await Event.findByIdAndUpdate(
    eventId,
    { status: EventStatus.Draft },
    { new: true }
  );
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

export async function deleteEventAdmin(eventId: string) {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  if (event.status === EventStatus.Live) {
    throw new AppError("Unpublish live events before deleting", 400, ErrorCodes.VALIDATION_ERROR);
  }
  await event.deleteOne();
}

export async function getAdminEvent(eventId: string) {
  const event = await Event.findById(eventId).populate("organizer");
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

export async function approveEventAdmin(eventId: string) {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);

  event.approvalStatus = EventApprovalStatus.Approved;
  event.status = EventStatus.Live;
  event.rejectionReason = undefined;
  event.changesRequested = undefined;
  normalizeLiveEventTicketSections(event);
  await event.save();
  invalidatePublicEventCaches(event.slug);
  return event;
}

export async function rejectEventAdmin(eventId: string, reason?: string) {
  const event = await Event.findByIdAndUpdate(
    eventId,
    {
      approvalStatus: EventApprovalStatus.Rejected,
      status: EventStatus.Rejected,
      rejectionReason: reason,
    },
    { new: true }
  );
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

export async function requestEventChanges(eventId: string, message: string) {
  const event = await Event.findByIdAndUpdate(
    eventId,
    {
      changesRequested: message,
      status: EventStatus.Draft,
      approvalStatus: EventApprovalStatus.Pending,
    },
    { new: true }
  );
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

export async function updateEventModeration(
  eventId: string,
  data: {
    featured?: boolean;
    trending?: boolean;
    homepagePriority?: number;
    listingRank?: number;
  }
) {
  const event = await Event.findByIdAndUpdate(eventId, data, { new: true });
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

export async function adminOverrideEventContent(
  eventId: string,
  data: {
    ticketSections?: unknown[];
    customForm?: { enabled: boolean; fields: unknown[] };
    forceSegmentStatus?: { sectionId: string; status: SegmentStatus; isVisible?: boolean }[];
  }
) {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);

  if (data.ticketSections) {
    event.ticketSections = data.ticketSections as typeof event.ticketSections;
  }
  if (data.customForm) {
    event.customForm = data.customForm as typeof event.customForm;
  }
  if (data.forceSegmentStatus?.length) {
    for (const patch of data.forceSegmentStatus) {
      const section = findTicketSection(event, patch.sectionId);
      if (!section) continue;
      section.status = patch.status;
      if (patch.isVisible != null) section.isVisible = patch.isVisible;
      if (patch.status === SegmentStatus.SoldOut) {
        section.quantitySold = section.capacity;
      }
    }
  }
  await event.save();
  return event;
}
