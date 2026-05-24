import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Event } from "@/modules/events/models/event.model.js";
import type { EventDocument } from "@/modules/events/models/event.model.js";
import {
  EventApprovalStatus,
  EventStatus,
} from "@/modules/events/types/event.types.js";
import type { CreateEventInput } from "@/modules/events/validators/event.validator.js";
import {
  normalizeMediaUrl,
} from "@/shared/utils/normalize-media-url.js";
import { persistMediaImage } from "@/shared/upload/persist-media-image.js";
import { UPLOAD_TYPE_FOLDERS, UploadType } from "@/modules/uploads/constants/upload.constants.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { OrganizerVerificationStatus } from "@/modules/organizers/types/organizer.types.js";

export async function createEvent(
  userId: string,
  input: CreateEventInput
): Promise<EventDocument> {
  const organizer = await Organizer.findOne({
    userId,
    verificationStatus: OrganizerVerificationStatus.Approved,
  });

  if (!organizer) {
    throw new AppError(
      "Approved organizer profile required to create events",
      403,
      ErrorCodes.FORBIDDEN
    );
  }

  if (input.endDate <= input.startDate) {
    throw new AppError("End date must be after start date", 400, ErrorCodes.VALIDATION_ERROR);
  }

  const exists = await Event.findOne({ slug: input.slug });
  if (exists) {
    throw new AppError("Event slug already exists", 409, ErrorCodes.CONFLICT);
  }

  const totalSectionCapacity = input.ticketSections.reduce((sum, s) => sum + s.capacity, 0);
  if (totalSectionCapacity > input.capacity) {
    throw new AppError(
      "Ticket section capacity exceeds event capacity",
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  const cover = input.coverImage
    ? await persistMediaImage(input.coverImage, UPLOAD_TYPE_FOLDERS[UploadType.EventBanner])
    : { url: undefined, publicId: null };

  return Event.create({
    ...input,
    coverImage: cover.url,
    coverImagePublicId: cover.publicId ?? undefined,
    videoThumbnail: normalizeMediaUrl(input.videoThumbnail),
    registrationStart: input.registrationStart,
    registrationEnd: input.registrationEnd,
    city: input.venue.city,
    country: input.venue.country,
    organizer: organizer._id,
    status: EventStatus.Draft,
    approvalStatus: EventApprovalStatus.Pending,
    ticketSections: input.ticketSections.map((s) => ({
      ...s,
      quantitySold: 0,
    })),
  });
}

export async function listPublicEvents(query: {
  category?: string;
  city?: string;
  page?: number;
  limit?: number;
}) {
  const { listPublicEventsCached } = await import(
    "@/modules/events/services/event-public.service.js"
  );
  return listPublicEventsCached(query);
}

export async function getEventBySlug(slug: string) {
  const { getPublicEventBySlug } = await import(
    "@/modules/events/services/event-public.service.js"
  );
  return getPublicEventBySlug(slug);
}

export async function approveEvent(eventId: string): Promise<EventDocument | null> {
  return Event.findByIdAndUpdate(
    eventId,
    { approvalStatus: EventApprovalStatus.Approved, status: EventStatus.Live },
    { new: true }
  );
}

export async function rejectEvent(eventId: string): Promise<EventDocument | null> {
  return Event.findByIdAndUpdate(
    eventId,
    { approvalStatus: EventApprovalStatus.Rejected },
    { new: true }
  );
}

export async function listCategories(): Promise<string[]> {
  return Event.distinct("category", {
    status: EventStatus.Live,
    approvalStatus: EventApprovalStatus.Approved,
  });
}
