import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import {
  createPayoutSchema,
  payoutListQuerySchema,
} from "@/modules/payments/validators/payout.validator.js";
import * as payoutService from "@/modules/payments/services/payout.service.js";
export const summary = asyncHandler(async (req: Request, res: Response) => {
  const data = await payoutService.getOrganizerEarningsSummary(req.user!.id);
  res.json({ success: true, data });
});

export const payoutableEvents = asyncHandler(async (req: Request, res: Response) => {
  const data = await payoutService.getPayoutableEvents(req.user!.id);
  res.json({ success: true, data });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const q = payoutListQuerySchema.parse(req.query);
  const data = await payoutService.getOrganizerPayouts(req.user!.id, q);
  res.json({ success: true, data });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = createPayoutSchema.parse(req.body);
  const payout = await payoutService.createPayoutRequest(
    req.user!.id,
    body.eventIds,
    body.requestNote
  );
  res.status(201).json({ success: true, data: payout });
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const data = await payoutService.getOrganizerPayoutDetail(
    req.user!.id,
    req.params.payoutId as string
  );
  res.json({ success: true, data });
});

export const listValidators = [validate(payoutListQuerySchema, "query")];
export const createValidators = [validate(createPayoutSchema)];
