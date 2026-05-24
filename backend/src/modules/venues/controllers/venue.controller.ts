import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as venueService from "@/modules/venues/services/venue.service.js";
import { createAuditLog } from "@/modules/audit/services/audit.service.js";

export const listAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const venues = await venueService.listVenuesAdmin();
  res.json({ success: true, data: { venues } });
});

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const city = req.query.city as string | undefined;
  const venues = await venueService.listActiveVenues(city);
  res.json({ success: true, data: { venues } });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const venue = await venueService.createVenue(req.body);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "venue.create",
    resource: "venue",
    metadata: { venueId: venue._id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.status(201).json({ success: true, data: { venue }, message: "Venue created" });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const venue = await venueService.updateVenue(req.params.id as string, req.body);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "venue.update",
    resource: "venue",
    metadata: { venueId: venue._id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data: { venue }, message: "Venue updated" });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await venueService.deleteVenue(req.params.id as string);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "venue.delete",
    resource: "venue",
    metadata: { venueId: req.params.id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, message: "Venue deleted" });
});
