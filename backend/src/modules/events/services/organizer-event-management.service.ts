import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Role } from "@/shared/enums/role.enum.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import {
  EventApprovalStatus,
  EventStatus,
} from "@/modules/events/types/event.types.js";
import { getOrganizerEvent } from "@/modules/events/services/organizer-event.service.js";
import { OrganizerVerificationStatus } from "@/modules/organizers/types/organizer.types.js";

export type OrganizerEventListStatus = "all" | "published" | "draft" | "ended";
export type OrganizerEventListSort = "newest" | "oldest" | "most_sold" | "revenue";

export interface OrganizerEventListQuery {
  search?: string;
  status?: OrganizerEventListStatus;
  sort?: OrganizerEventListSort;
  page?: number;
  limit?: number;
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

export async function listOrganizerEventsEnriched(
  userId: string,
  query: OrganizerEventListQuery,
  role?: Role
) {
  const organizer =
    role === Role.Admin || role === Role.SuperAdmin
      ? null
      : await getApprovedOrganizer(userId);

  const { aggregateOrganizerEventList } = await import(
    "@/modules/events/services/organizer-event-list.service.js"
  );
  return aggregateOrganizerEventList(organizer?._id ?? null, query);
}

export async function publishOrganizerEvent(userId: string, eventId: string) {
  const event = await getOrganizerEvent(userId, eventId);
  if (event.approvalStatus !== EventApprovalStatus.Approved) {
    throw new AppError(
      "Event must be approved before publishing",
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }
  event.status = EventStatus.Live;
  await event.save();
  const { invalidatePublicEventCaches } = await import(
    "@/modules/events/utils/event-cache.util.js"
  );
  invalidatePublicEventCaches(event.slug);
  return event;
}

export async function unpublishOrganizerEvent(userId: string, eventId: string) {
  const event = await getOrganizerEvent(userId, eventId);
  if (event.status !== EventStatus.Live) {
    throw new AppError("Only live events can be unpublished", 400, ErrorCodes.VALIDATION_ERROR);
  }
  event.status = EventStatus.Draft;
  await event.save();
  const { invalidatePublicEventCaches } = await import(
    "@/modules/events/utils/event-cache.util.js"
  );
  invalidatePublicEventCaches(event.slug);
  return event;
}

export async function getEventOverview(
  userId: string,
  eventId: string,
  role?: Role
) {
  const { getEventOverviewSlim } = await import(
    "@/modules/events/services/organizer-event-insights.service.js"
  );
  return getEventOverviewSlim(userId, eventId, role);
}

export async function getEventAnalytics(
  userId: string,
  eventId: string,
  role?: Role
) {
  const { getEventAnalyticsSlim } = await import(
    "@/modules/events/services/organizer-event-insights.service.js"
  );
  return getEventAnalyticsSlim(userId, eventId, role);
}
