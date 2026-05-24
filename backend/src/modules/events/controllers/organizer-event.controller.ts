import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { Role } from "@/shared/enums/role.enum.js";
import { createEvent } from "@/modules/events/services/event.service.js";
import {
  getOrganizerEvent,
  updateOrganizerEvent,
  deleteOrganizerEvent,
  duplicateOrganizerEvent,
  submitEventForReview,
  saveEventDraft,
} from "@/modules/events/services/organizer-event.service.js";
import {
  getEventAnalytics,
  getEventOverview,
  listOrganizerEventsEnriched,
  publishOrganizerEvent,
  unpublishOrganizerEvent,
  type OrganizerEventListSort,
  type OrganizerEventListStatus,
} from "@/modules/events/services/organizer-event-management.service.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const role = req.user!.role as Role;
  const data = await listOrganizerEventsEnriched(
    req.user!.id,
    {
      search: req.query.search as string | undefined,
      status: req.query.status as OrganizerEventListStatus | undefined,
      sort: req.query.sort as OrganizerEventListSort | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    },
    role
  );
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const event = await createEvent(req.user!.id, req.body);
  res.status(201).json({ success: true, data: { event } });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const event = await getOrganizerEvent(req.user!.id, req.params.id as string);
  res.json({ success: true, data: { event } });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const event = await updateOrganizerEvent(
    req.user!.id,
    req.params.id as string,
    req.body,
    { role: req.user!.role as Role }
  );
  res.json({ success: true, data: { event } });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await deleteOrganizerEvent(req.user!.id, req.params.id as string);
  res.json({ success: true, message: "Event deleted" });
});

export const duplicate = asyncHandler(async (req: Request, res: Response) => {
  const event = await duplicateOrganizerEvent(req.user!.id, req.params.id as string);
  res.status(201).json({ success: true, data: { event } });
});

export const submitForReview = asyncHandler(async (req: Request, res: Response) => {
  const event = await submitEventForReview(req.user!.id, req.params.id as string);
  res.json({ success: true, data: { event }, message: "Submitted for admin review" });
});

export const saveDraft = asyncHandler(async (req: Request, res: Response) => {
  const event = await saveEventDraft(req.user!.id, req.params.id as string);
  res.json({ success: true, data: { event } });
});

export const preview = asyncHandler(async (req: Request, res: Response) => {
  const event = await getOrganizerEvent(req.user!.id, req.params.id as string);
  res.json({ success: true, data: { event, preview: true } });
});

export const overview = asyncHandler(async (req: Request, res: Response) => {
  const eventId = (req.params.eventId ?? req.params.id) as string;
  const data = await getEventOverview(req.user!.id, eventId, req.user!.role as Role);
  res.json({ success: true, data });
});

export const analytics = asyncHandler(async (req: Request, res: Response) => {
  const eventId = (req.params.eventId ?? req.params.id) as string;
  const data = await getEventAnalytics(req.user!.id, eventId, req.user!.role as Role);
  res.json({ success: true, data });
});

export const publish = asyncHandler(async (req: Request, res: Response) => {
  const eventId = (req.params.eventId ?? req.params.id) as string;
  const event = await publishOrganizerEvent(req.user!.id, eventId);
  res.json({ success: true, data: { event }, message: "Event published" });
});

export const unpublish = asyncHandler(async (req: Request, res: Response) => {
  const eventId = (req.params.eventId ?? req.params.id) as string;
  const event = await unpublishOrganizerEvent(req.user!.id, eventId);
  res.json({ success: true, data: { event }, message: "Event unpublished" });
});
