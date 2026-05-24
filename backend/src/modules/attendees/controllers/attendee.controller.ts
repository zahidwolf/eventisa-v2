import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import {
  attendeesToCsv,
  listEventAttendees,
} from "@/modules/attendees/services/attendee.service.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const organizerId = req.user!.id;
  const search = req.query.search as string | undefined;
  const rows = await listEventAttendees(req.params.eventId as string, organizerId, search);
  res.json({ success: true, data: { attendees: rows } });
});

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const organizerId = req.user!.id;
  const rows = await listEventAttendees(req.params.eventId as string, organizerId);
  const csv = attendeesToCsv(rows);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="attendees-${req.params.eventId}.csv"`);
  res.send(csv);
});
