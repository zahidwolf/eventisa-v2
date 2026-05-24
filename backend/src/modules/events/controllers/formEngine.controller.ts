import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as formService from "@/modules/events/services/formEngine.service.js";

export const addGlobalField = asyncHandler(async (req: Request, res: Response) => {
  const field = await formService.addField(req.params.eventId as string, req.user!.id, null, req.body);
  res.status(201).json({ success: true, data: { field } });
});

export const addSegmentField = asyncHandler(async (req: Request, res: Response) => {
  const field = await formService.addField(
    req.params.eventId as string,
    req.user!.id,
    req.params.segmentId as string,
    req.body
  );
  res.status(201).json({ success: true, data: { field } });
});

export const updateGlobalField = asyncHandler(async (req: Request, res: Response) => {
  const field = await formService.updateField(
    req.params.eventId as string,
    req.user!.id,
    null,
    req.params.fieldId as string,
    req.body
  );
  res.json({ success: true, data: { field } });
});

export const updateSegmentField = asyncHandler(async (req: Request, res: Response) => {
  const field = await formService.updateField(
    req.params.eventId as string,
    req.user!.id,
    req.params.segmentId as string,
    req.params.fieldId as string,
    req.body
  );
  res.json({ success: true, data: { field } });
});

export const deleteGlobalField = asyncHandler(async (req: Request, res: Response) => {
  await formService.deleteField(
    req.params.eventId as string,
    req.user!.id,
    null,
    req.params.fieldId as string
  );
  res.json({ success: true, message: "Field deleted" });
});

export const deleteSegmentField = asyncHandler(async (req: Request, res: Response) => {
  await formService.deleteField(
    req.params.eventId as string,
    req.user!.id,
    req.params.segmentId as string,
    req.params.fieldId as string
  );
  res.json({ success: true, message: "Field deleted" });
});

export const reorderGlobal = asyncHandler(async (req: Request, res: Response) => {
  const fields = await formService.reorderFields(
    req.params.eventId as string,
    req.user!.id,
    null,
    req.body.orderedFieldIds
  );
  res.json({ success: true, data: { fields } });
});

export const reorderSegment = asyncHandler(async (req: Request, res: Response) => {
  const fields = await formService.reorderFields(
    req.params.eventId as string,
    req.user!.id,
    req.params.segmentId as string,
    req.body.orderedFieldIds
  );
  res.json({ success: true, data: { fields } });
});

export const listGlobal = asyncHandler(async (req: Request, res: Response) => {
  const fields = await formService.listFields(req.params.eventId as string, req.user!.id, null);
  res.json({ success: true, data: { fields } });
});

export const validateSubmission = asyncHandler(async (req: Request, res: Response) => {
  const result = await formService.validateEventSubmission(
    req.params.eventId as string,
    req.body.segmentId ?? null,
    req.body.answers ?? {}
  );
  res.json({ success: true, data: result });
});
