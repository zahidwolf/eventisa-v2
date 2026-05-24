import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as attendeeService from "@/modules/events/services/attendeeData.service.js";

function userContext(req: Request) {
  return { userId: req.user!.id, role: req.user!.role };
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = userContext(req);
  const data = await attendeeService.getSubmissionsByEvent(
    req.params.eventId as string,
    userId,
    role,
    {
      segmentId: req.query.segmentId as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      search: req.query.search as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    }
  );
  res.json({ success: true, data });
});

export const listBySegment = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = userContext(req);
  const data = await attendeeService.getSubmissionsBySegment(
    req.params.eventId as string,
    userId,
    role,
    req.params.segmentId as string,
    {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    }
  );
  res.json({ success: true, data });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = userContext(req);
  const data = await attendeeService.getSubmissionById(
    req.params.eventId as string,
    userId,
    role,
    req.params.submissionId as string
  );
  res.json({ success: true, data });
});

export const exportAttendees = asyncHandler(async (req: Request, res: Response) => {
  const { userId, role } = userContext(req);
  const eventId = req.params.eventId as string;
  const segmentId = (req.query.segmentId as string) || null;
  const format = (req.query.format as string) === "excel" ? "excel" : "csv";

  if (format === "excel") {
    const buffer = await attendeeService.exportToExcel(eventId, userId, role, segmentId);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendees-${eventId}.xlsx"`
    );
    res.send(buffer);
    return;
  }

  const csv = await attendeeService.exportToCSV(eventId, userId, role, segmentId);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="attendees-${eventId}.csv"`);
  res.send(csv);
});
