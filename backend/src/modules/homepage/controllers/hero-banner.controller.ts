import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as heroBannerService from "@/modules/homepage/services/hero-banner.service.js";
import { createAuditLog } from "@/modules/audit/services/audit.service.js";

export const listAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const banners = await heroBannerService.listHeroBannersAdmin();
  res.json({ success: true, data: { banners } });
});

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const banners = await heroBannerService.listActiveHeroBanners();
  res.json({ success: true, data: { banners } });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const banner = await heroBannerService.createHeroBanner(req.body);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "hero_banner.create",
    resource: "hero_banner",
    metadata: { bannerId: banner._id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.status(201).json({ success: true, data: { banner }, message: "Hero banner created" });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const banner = await heroBannerService.updateHeroBanner(req.params.id as string, req.body);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "hero_banner.update",
    resource: "hero_banner",
    metadata: { bannerId: banner._id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data: { banner }, message: "Hero banner updated" });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await heroBannerService.deleteHeroBanner(req.params.id as string);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "hero_banner.delete",
    resource: "hero_banner",
    metadata: { bannerId: req.params.id },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, message: "Hero banner deleted" });
});
