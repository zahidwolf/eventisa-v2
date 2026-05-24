import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Event } from "@/modules/events/models/event.model.js";
import { findTicketSection } from "@/modules/events/utils/section.util.js";
import { sectionDocId } from "@/modules/events/utils/event-builder.mapper.js";
import * as promoCodeService from "@/modules/events/services/promoCode.service.js";

export const create = asyncHandler(async (req: Request, res: Response) => {
  const doc = await promoCodeService.createCode(
    req.user!.id,
    req.user!.role,
    req.params.eventId as string,
    req.body
  );
  res.status(201).json({ success: true, data: { promoCode: doc } });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const codes = await promoCodeService.getCodesByEvent(
    req.params.eventId as string,
    req.user!.id,
    req.user!.role
  );
  res.json({ success: true, data: { promoCodes: codes } });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const doc = await promoCodeService.updateCode(
    req.params.codeId as string,
    req.user!.id,
    req.user!.role,
    req.body
  );
  res.json({ success: true, data: { promoCode: doc } });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const result = await promoCodeService.deleteCode(
    req.params.codeId as string,
    req.user!.id,
    req.user!.role
  );
  res.json({ success: true, data: result });
});

export const stats = asyncHandler(async (req: Request, res: Response) => {
  const data = await promoCodeService.getCodeStats(
    req.params.codeId as string,
    req.user!.id,
    req.user!.role
  );
  res.json({ success: true, data });
});

export const validatePublic = asyncHandler(async (req: Request, res: Response) => {
  const eventId = req.params.eventId as string;
  const { code, segmentId, quantity } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  }

  const section = findTicketSection(event, segmentId);
  if (!section) {
    throw new AppError("Ticket segment not found", 404, ErrorCodes.NOT_FOUND);
  }

  const resolvedSegmentId = sectionDocId(section);
  const unitPrice = section.isFree ? 0 : section.price;

  const result = await promoCodeService.validateCode(
    code,
    eventId,
    resolvedSegmentId,
    unitPrice,
    quantity,
    {
      userId: req.user?.id,
      guestEmail: typeof req.body.guestEmail === "string" ? req.body.guestEmail : undefined,
    }
  );

  res.json({ success: true, data: result });
});
