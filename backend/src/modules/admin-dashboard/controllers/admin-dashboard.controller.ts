import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { getAdminDashboard } from "@/modules/admin-dashboard/services/admin-dashboard.service.js";

export const overview = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getAdminDashboard();
  res.json({ success: true, data });
});
