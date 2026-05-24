import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as cityService from "@/modules/cities/services/city.service.js";
import { createAuditLog } from "@/modules/audit/services/audit.service.js";

export const listAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const cities = await cityService.listCitiesAdmin();
  res.json({ success: true, data: { cities } });
});

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const cities = await cityService.listActiveCities();
  res.json({ success: true, data: { cities } });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const city = await cityService.createCity(req.body);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "city.create",
    resource: "city",
    metadata: { cityId: city._id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.status(201).json({ success: true, data: { city }, message: "City created" });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const city = await cityService.updateCity(req.params.id as string, req.body);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "city.update",
    resource: "city",
    metadata: { cityId: city._id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data: { city }, message: "City updated" });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await cityService.deleteCity(req.params.id as string);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "city.delete",
    resource: "city",
    metadata: { cityId: req.params.id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, message: "City deleted" });
});
