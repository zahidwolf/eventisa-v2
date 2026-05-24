import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import {
  listPendingEvents,
  listEventsForAdminFiltered,
  getAdminEvent,
  approveEventAdmin,
  rejectEventAdmin,
  requestEventChanges,
  updateEventModeration,
  adminOverrideEventContent,
  unpublishEventAdmin,
  deleteEventAdmin,
} from "@/modules/events/services/admin-event.service.js";
import { adminUpdateEvent } from "@/modules/events/services/organizer-event.service.js";
import { createAuditLog } from "@/modules/audit/services/audit.service.js";
import { logAdminActivity } from "@/shared/adminActivity.service.js";
import { onEventApproved, onEventCancelled, onEventRejected } from "@/shared/email/emailTriggers.service.js";
import { invalidateAdminCachesOnModeration } from "@/modules/admin/utils/admin-cache.util.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = {
    search: req.query.search as string | undefined,
    status: req.query.status as string | undefined,
    category: req.query.category as string | undefined,
    sort: req.query.sort as "newest" | "oldest" | "revenue" | "tickets" | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  };
  const data = await listEventsForAdminFiltered(query);
  res.json({ success: true, data });
});

export const listPending = asyncHandler(async (_req: Request, res: Response) => {
  const events = await listPendingEvents();
  res.json({ success: true, data: { events } });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const event = await getAdminEvent(req.params.id as string);
  res.json({ success: true, data: { event } });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const event = await adminUpdateEvent(req.params.id as string, req.body);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "event.update",
    resource: "event",
    resourceId: req.params.id as string,
    metadata: { status: event.status },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data: { event } });
});

export const approve = asyncHandler(async (req: Request, res: Response) => {
  const event = await approveEventAdmin(req.params.id as string);
  invalidateAdminCachesOnModeration();
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "event.approve",
    resource: "event",
    resourceId: req.params.id as string,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  await logAdminActivity({
    adminId: req.admin!.id,
    adminName: req.admin!.email,
    action: "event.approve",
    targetType: "event",
    targetId: req.params.id as string,
    targetName: event.title,
  });
  onEventApproved(event._id.toString()).catch((err) => console.error("Email trigger failed:", err));
  res.json({ success: true, data: { event }, message: "Event approved and live" });
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const event = await rejectEventAdmin(req.params.id as string, req.body.reason);
  invalidateAdminCachesOnModeration();
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "event.reject",
    resource: "event",
    resourceId: req.params.id as string,
    metadata: { reason: req.body.reason },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  onEventRejected(event._id.toString(), req.body.reason ?? "").catch((err) =>
    console.error("Email trigger failed:", err)
  );
  res.json({ success: true, data: { event }, message: "Event rejected" });
});

export const requestChanges = asyncHandler(async (req: Request, res: Response) => {
  const event = await requestEventChanges(req.params.id as string, req.body.message);
  res.json({ success: true, data: { event }, message: "Change request sent to organizer" });
});

export const updateModeration = asyncHandler(async (req: Request, res: Response) => {
  const event = await updateEventModeration(req.params.id as string, req.body);
  res.json({ success: true, data: { event } });
});

export const unpublish = asyncHandler(async (req: Request, res: Response) => {
  const event = await unpublishEventAdmin(req.params.id as string);
  res.json({ success: true, data: { event }, message: "Event unpublished" });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.id as string;
  onEventCancelled(eventId).catch((err) => console.error("Email trigger failed:", err));
  await deleteEventAdmin(eventId);
  res.json({ success: true, message: "Event deleted" });
});

export const overrideContent = asyncHandler(async (req: Request, res: Response) => {
  const event = await adminOverrideEventContent(req.params.id as string, req.body);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "event.override",
    resource: "event",
    resourceId: req.params.id as string,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data: { event }, message: "Event content updated by admin" });
});
