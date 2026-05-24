import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as segmentService from "@/modules/events/services/segmentBuilder.service.js";
import { SegmentStatus } from "@/modules/events/models/ticket-section.schema.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const segment = await segmentService.createSegment(
    req.params.eventId as string,
    req.user!.id,
    req.body
  );
  res.status(201).json({ success: true, data: { segment } });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const segment = await segmentService.updateSegment(
    req.params.eventId as string,
    req.user!.id,
    req.params.segmentId as string,
    req.body
  );
  res.json({ success: true, data: { segment } });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await segmentService.deleteSegment(
    req.params.eventId as string,
    req.user!.id,
    req.params.segmentId as string
  );
  res.json({ success: true, message: "Segment deleted" });
});

export const reorder = asyncHandler(async (req: Request, res: Response) => {
  const segments = await segmentService.reorderSegments(
    req.params.eventId as string,
    req.user!.id,
    req.body.orderedIds
  );
  res.json({ success: true, data: { segments } });
});

export const forceStatus = asyncHandler(async (req: Request, res: Response) => {
  const segment = await segmentService.forceSegmentStatus(
    req.params.eventId as string,
    req.params.segmentId as string,
    req.body.status as SegmentStatus
  );
  res.json({ success: true, data: { segment } });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const segments = await segmentService.listSegments(
    req.params.eventId as string,
    req.user!.id
  );
  res.json({ success: true, data: { segments } });
});
