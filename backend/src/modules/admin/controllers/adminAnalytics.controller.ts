import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { parseAnalyticsDays } from "@/modules/admin/services/adminAnalytics.util.js";
import * as analytics from "@/modules/admin/services/adminAnalytics.service.js";

export const overview = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await analytics.getPlatformOverview() });
});

export const revenue = asyncHandler(async (req: Request, res: Response) => {
  const days = parseAnalyticsDays(req.query.days);
  res.json({ success: true, data: await analytics.getRevenueOverTime(days) });
});

export const tickets = asyncHandler(async (req: Request, res: Response) => {
  const days = parseAnalyticsDays(req.query.days);
  res.json({ success: true, data: await analytics.getTicketsSoldOverTime(days) });
});

export const users = asyncHandler(async (req: Request, res: Response) => {
  const days = parseAnalyticsDays(req.query.days);
  res.json({ success: true, data: await analytics.getUserGrowthOverTime(days) });
});

export const events = asyncHandler(async (req: Request, res: Response) => {
  const days = parseAnalyticsDays(req.query.days);
  res.json({ success: true, data: await analytics.getEventCreationOverTime(days) });
});

export const byCategory = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await analytics.getRevenueByCategory() });
});

export const byCity = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await analytics.getRevenueByCity() });
});

export const topEvents = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  res.json({ success: true, data: await analytics.getTopEventsByRevenue(limit) });
});

export const topOrganizers = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  res.json({ success: true, data: await analytics.getTopOrganizersByRevenue(limit) });
});

export const orderStatus = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await analytics.getOrderStatusBreakdown() });
});

export const recent = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await analytics.getRecentActivity() });
});
