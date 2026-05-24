import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import {
  getFeaturedCurationForAdmin,
  getOrCreateHomepageConfig,
  getTrendingCurationForAdmin,
  setFeaturedEventIds,
  setTrendingEventIds,
  updateHomepageConfig,
} from "@/modules/homepage/services/homepage-config.service.js";
import { createAuditLog } from "@/modules/audit/services/audit.service.js";

export const getConfig = asyncHandler(async (_req: Request, res: Response) => {
  const config = await getOrCreateHomepageConfig();
  res.json({ success: true, data: { config } });
});

export const getFeaturedCuration = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getFeaturedCurationForAdmin();
  res.json({ success: true, data });
});

export const updateFeaturedCuration = asyncHandler(async (req: Request, res: Response) => {
  const { featuredEventIds } = req.body as { featuredEventIds: string[] };
  await setFeaturedEventIds(featuredEventIds, req.admin!.id);
  const data = await getFeaturedCurationForAdmin();
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "homepage.featured_events",
    resource: "homepage",
    metadata: { count: featuredEventIds.length },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data, message: "Featured events updated" });
});

export const getTrendingCuration = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getTrendingCurationForAdmin();
  res.json({ success: true, data });
});

export const updateTrendingCuration = asyncHandler(async (req: Request, res: Response) => {
  const { trendingEventIds } = req.body as { trendingEventIds: string[] };
  await setTrendingEventIds(trendingEventIds, req.admin!.id);
  const data = await getTrendingCurationForAdmin();
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "homepage.trending_events",
    resource: "homepage",
    metadata: { count: trendingEventIds.length },
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data, message: "Trending events updated" });
});

export const updateConfig = asyncHandler(async (req: Request, res: Response) => {
  const config = await updateHomepageConfig(req.body, req.admin!.id);
  await createAuditLog({
    actorId: req.admin!.id,
    actorEmail: req.admin!.email,
    action: "homepage.update",
    resource: "homepage",
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data: { config } });
});
