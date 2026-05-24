import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { getOrganizerAnalytics } from "@/modules/analytics/services/organizer-analytics.service.js";
import { getAdminAnalytics } from "@/modules/analytics/services/admin-analytics.service.js";

export const organizer = asyncHandler(async (req: Request, res: Response) => {
  const data = await getOrganizerAnalytics(req.user!.id, req.query.eventId as string | undefined);
  res.json({ success: true, data });
});

export const admin = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await getAdminAnalytics() });
});
