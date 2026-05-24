import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Event } from "@/modules/events/models/event.model.js";
import {
  EventApprovalStatus,
  EventStatus,
} from "@/modules/events/types/event.types.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { OrganizerVerificationStatus } from "@/modules/organizers/types/organizer.types.js";
import type { CreateEventInput } from "@/modules/events/validators/event.validator.js";
import {
  normalizeMediaUrl,
} from "@/shared/utils/normalize-media-url.js";
import { replaceMediaIfChanged } from "@/shared/upload/persist-media-image.js";
import { UPLOAD_TYPE_FOLDERS, UploadType } from "@/modules/uploads/constants/upload.constants.js";
import { Role } from "@/shared/enums/role.enum.js";
import { normalizeLiveEventTicketSections } from "@/modules/events/utils/segment.util.js";
import { getPlatformSettings } from "@/modules/admin/services/platformSettings.service.js";
import { approveEventAdmin } from "@/modules/events/services/admin-event.service.js";

function applyMediaFields(
  event: InstanceType<typeof Event>,
  input: Partial<CreateEventInput>
) {
  if (input.videoThumbnail !== undefined) {
    event.videoThumbnail = normalizeMediaUrl(input.videoThumbnail);
  }
  if (input.registrationStart !== undefined) {
    event.registrationStart = input.registrationStart;
  }
  if (input.registrationEnd !== undefined) {
    event.registrationEnd = input.registrationEnd;
  }
}

async function applyCoverImage(
  event: InstanceType<typeof Event>,
  coverImage: string | undefined
) {
  if (coverImage === undefined) return;
  const result = await replaceMediaIfChanged(
    coverImage,
    event.coverImage,
    event.coverImagePublicId,
    UPLOAD_TYPE_FOLDERS[UploadType.EventBanner]
  );
  event.coverImage = result.url;
  event.coverImagePublicId = result.publicId ?? undefined;
}

async function getApprovedOrganizer(userId: string) {
  const organizer = await Organizer.findOne({
    userId,
    verificationStatus: OrganizerVerificationStatus.Approved,
  });
  if (!organizer) {
    throw new AppError("Approved organizer profile required", 403, ErrorCodes.FORBIDDEN);
  }
  return organizer;
}

export async function listOrganizerEvents(userId: string) {
  const organizer = await getApprovedOrganizer(userId);
  return Event.find({ organizer: organizer._id }).sort({ updatedAt: -1 });
}

export async function getOrganizerEvent(userId: string, eventId: string) {
  const organizer = await getApprovedOrganizer(userId);
  const event = await Event.findOne({ _id: eventId, organizer: organizer._id });
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

async function applyEventUpdateData(
  event: InstanceType<typeof Event>,
  input: Partial<CreateEventInput>
) {
  const {
    coverImage: _cover,
    videoThumbnail: _video,
    venue,
    ticketSections,
    customForm,
    registrationStart: _rs,
    registrationEnd: _re,
    capacity: inputCapacity,
    ...scalarFields
  } = input;
  void _cover;
  void _video;
  void _rs;
  void _re;

  Object.assign(event, scalarFields);
  applyMediaFields(event, input);
  await applyCoverImage(event, input.coverImage);

  if (venue !== undefined) {
    event.venue = {
      name: venue.name,
      address: venue.address,
      city: venue.city,
      country: venue.country ?? event.country ?? "Bangladesh",
      mapUrl: venue.mapUrl,
    };
    event.city = venue.city;
    event.country = venue.country ?? event.country;
    event.markModified("venue");
  }

  if (ticketSections !== undefined) {
    event.ticketSections = ticketSections as typeof event.ticketSections;
    event.markModified("ticketSections");
    const sectionCapacity = ticketSections.reduce((sum, s) => sum + (s.capacity ?? 0), 0);
    event.capacity = Math.max(sectionCapacity, 1);
  } else if (inputCapacity !== undefined) {
    event.capacity = inputCapacity;
  }

  if (customForm !== undefined) {
    event.customForm = customForm as typeof event.customForm;
    event.markModified("customForm");
  }

  normalizeLiveEventTicketSections(event);

  await event.save();
  const { invalidatePublicEventCaches } = await import(
    "@/modules/events/utils/event-cache.util.js"
  );
  invalidatePublicEventCaches(event.slug);
  return event;
}

export async function updateOrganizerEvent(
  userId: string,
  eventId: string,
  input: Partial<CreateEventInput>,
  options?: { role?: Role }
) {
  const isAdmin = options?.role === Role.Admin || options?.role === Role.SuperAdmin;
  const event = isAdmin
    ? await Event.findById(eventId)
    : await getOrganizerEvent(userId, eventId);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);

  if (!isAdmin && [EventStatus.Live, EventStatus.Ended].includes(event.status as EventStatus)) {
    throw new AppError("Cannot edit live or ended events", 400, ErrorCodes.VALIDATION_ERROR);
  }

  return applyEventUpdateData(event, input);
}

/** Admin can edit live and ended events; no organizer ownership check. */
export async function adminUpdateEvent(eventId: string, input: Partial<CreateEventInput>) {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return applyEventUpdateData(event, input);
}

export async function deleteOrganizerEvent(userId: string, eventId: string) {
  const event = await getOrganizerEvent(userId, eventId);
  if (event.status === EventStatus.Live) {
    throw new AppError("Cannot delete live events", 400, ErrorCodes.VALIDATION_ERROR);
  }
  await event.deleteOne();
}

export async function duplicateOrganizerEvent(userId: string, eventId: string) {
  const event = await getOrganizerEvent(userId, eventId);

  return Event.create({
    title: `${event.title} (Copy)`,
    slug: `${event.slug}-copy-${Date.now().toString(36)}`,
    shortDescription: event.shortDescription,
    description: event.description,
    coverImage: event.coverImage,
    category: event.category,
    tags: event.tags,
    venue: event.venue,
    city: event.city,
    country: event.country,
    startDate: event.startDate,
    endDate: event.endDate,
    ticketSections: event.ticketSections.map((s) => ({
      title: s.title,
      price: s.price,
      capacity: s.capacity,
      quantitySold: 0,
      maxPurchase: s.maxPurchase,
      benefits: s.benefits,
      isVisible: s.isVisible,
    })),
    capacity: event.capacity,
    status: EventStatus.Draft,
    approvalStatus: EventApprovalStatus.Pending,
    seo: event.seo,
    metaPixel: event.metaPixel,
    organizer: event.organizer,
    customForm: event.customForm,
  });
}

export async function submitEventForReview(userId: string, eventId: string) {
  const event = await getOrganizerEvent(userId, eventId);

  if (!event.ticketSections.length) {
    throw new AppError("Add at least one ticket section", 400, ErrorCodes.VALIDATION_ERROR);
  }

  const settings = await getPlatformSettings();
  if (!settings.eventControls.requireApproval) {
    await event.save();
    return approveEventAdmin(event._id.toString());
  }

  event.status = EventStatus.Pending;
  event.approvalStatus = EventApprovalStatus.Pending;
  await event.save();
  return event;
}

export async function saveEventDraft(userId: string, eventId: string) {
  const event = await getOrganizerEvent(userId, eventId);
  event.status = EventStatus.Draft;
  await event.save();
  return event;
}
