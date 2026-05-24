import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import { getOrganizerDashboardStats } from "@/modules/organizers/services/organizer-dashboard.service.js";

export const dashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const organizer = await Organizer.findOne({ userId: req.user!.id }).select("_id").lean();
  if (!organizer) {
    throw new AppError("Organizer profile not found", 404, ErrorCodes.NOT_FOUND);
  }
  const data = await getOrganizerDashboardStats(organizer._id);
  res.json({ success: true, data });
});
