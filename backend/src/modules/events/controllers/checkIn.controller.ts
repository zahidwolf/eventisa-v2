import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { CheckInRecordStatus } from "@/modules/events/models/checkIn.model.js";
import * as checkInService from "@/modules/events/services/checkIn.service.js";
import {
  getCheckInLog,
  getCheckInStats,
} from "@/modules/events/services/checkIn-report.service.js";

export const search = asyncHandler(async (req: Request, res: Response) => {
  const rows = await checkInService.searchTicketsForCheckIn(
    req.params.eventId as string,
    req.user!.id,
    req.user!.role,
    req.query.q as string
  );
  res.json({ success: true, data: { tickets: rows } });
});

export const manual = asyncHandler(async (req: Request, res: Response) => {
  const result = await checkInService.manualCheckIn(
    req.params.eventId as string,
    req.user!.id,
    req.user!.role,
    req.body.ticketNumber,
    req.body.deviceId
  );
  res.json({ success: true, data: { result } });
});

export const scan = asyncHandler(async (req: Request, res: Response) => {
  const result = await checkInService.processScan(
    req.params.eventId as string,
    req.user!.id,
    req.user!.role,
    req.body.qrPayload,
    req.body.deviceId
  );
  res.json({ success: true, data: { result } });
});

export const sync = asyncHandler(async (req: Request, res: Response) => {
  const results = await checkInService.bulkSyncOfflineScans(
    req.params.eventId as string,
    req.user!.id,
    req.user!.role,
    req.body.scans
  );
  res.json({ success: true, data: { results } });
});

export const stats = asyncHandler(async (req: Request, res: Response) => {
  const data = await getCheckInStats(
    req.params.eventId as string,
    req.user!.id,
    req.user!.role
  );
  res.json({ success: true, data });
});

export const log = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const data = await getCheckInLog(
    req.params.eventId as string,
    req.user!.id,
    req.user!.role,
    {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      segmentId: req.query.segmentId as string | undefined,
      status: status as CheckInRecordStatus | undefined,
    }
  );
  res.json({ success: true, data });
});
