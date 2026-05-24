import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import {
  createEvent,
  listPublicEvents,
  getEventBySlug,
  approveEvent,
  rejectEvent,
  listCategories,
} from "@/modules/events/services/event.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const event = await createEvent(req.user!.id, req.body);
  res.status(201).json({
    success: true,
    data: { event },
    message: "Event created. Pending admin approval.",
  });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { category, city, page, limit } = req.query;
  const result = await listPublicEvents({
    category: category as string | undefined,
    city: city as string | undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 12,
  });

  res.json({
    success: true,
    data: {
      events: result.events,
      pagination: {
        total: result.total,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
      },
    },
  });
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const event = await getEventBySlug(req.params.slug as string);
  if (!event) {
    throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  }
  res.json({ success: true, data: { event } });
});

export const getCheckoutForm = asyncHandler(async (req: Request, res: Response) => {
  const sectionId = String(req.query.sectionId ?? "");
  if (!sectionId) {
    throw new AppError("sectionId is required", 400, ErrorCodes.VALIDATION_ERROR);
  }
  const { getPublicCheckoutFormFields } = await import(
    "@/modules/events/services/event-public.service.js"
  );
  const fields = await getPublicCheckoutFormFields(req.params.slug as string, sectionId);
  if (!fields) {
    throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  }
  res.json({ success: true, data: fields });
});

export const categories = asyncHandler(async (_req: Request, res: Response) => {
  const cats = await listCategories();
  res.json({ success: true, data: { categories: cats } });
});

export const approve = asyncHandler(async (req: Request, res: Response) => {
  const event = await approveEvent(req.params.id as string);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  res.json({ success: true, data: { event }, message: "Event approved and live" });
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const event = await rejectEvent(req.params.id as string);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  res.json({ success: true, data: { event }, message: "Event rejected" });
});
