import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as svc from "@/modules/checkin/services/checkin.service.js";

export const scan = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.scanCheckIn(req.user!.id, req.body.qrData, req.body.eventId);
  res.json({ success: true, data });
});

export const manual = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.manualCheckIn(req.user!.id, req.body.ticketNumber, req.body.eventId);
  res.json({ success: true, data });
});

export const stats = asyncHandler(async (req: Request, res: Response) => {
  const data = await svc.getCheckInStats(req.user!.id, req.query.eventId as string);
  res.json({ success: true, data });
});
