import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import {
  getFeaturedEventsForHomepage,
  getTrendingEventsForHomepage,
} from "@/modules/homepage/services/homepage-config.service.js";

export const listFeaturedEvents = asyncHandler(async (_req: Request, res: Response) => {
  const events = await getFeaturedEventsForHomepage();
  res.json({ success: true, data: { events } });
});

export const listTrendingEvents = asyncHandler(async (_req: Request, res: Response) => {
  const events = await getTrendingEventsForHomepage();
  res.json({ success: true, data: { events } });
});
