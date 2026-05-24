import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import {
  adminPayoutListQuerySchema,
  markPaidPayoutSchema,
  rejectPayoutSchema,
} from "@/modules/payments/validators/payout.validator.js";
import * as payoutService from "@/modules/payments/services/payout.service.js";

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  const data = await payoutService.getAdminPayoutStats();
  res.json({ success: true, data });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const q = adminPayoutListQuerySchema.parse(req.query);
  const data = await payoutService.getAllPayouts(q);
  res.json({ success: true, data });
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  const data = await payoutService.getPayoutDetail(req.params.id as string);
  res.json({ success: true, data });
});

export const approve = asyncHandler(async (req: Request, res: Response) => {
  const payout = await payoutService.approvePayoutRequest(
    req.params.id as string,
    req.admin!.id
  );
  res.json({ success: true, data: payout });
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const body = rejectPayoutSchema.parse(req.body);
  const payout = await payoutService.rejectPayoutRequest(
    req.params.id as string,
    req.admin!.id,
    body.reason
  );
  res.json({ success: true, data: payout });
});

export const markPaid = asyncHandler(async (req: Request, res: Response) => {
  const body = markPaidPayoutSchema.parse(req.body);
  const payout = await payoutService.markPayoutAsPaid(
    req.params.id as string,
    req.admin!.id,
    body.txRef,
    body.paymentMethod,
    body.paymentNote
  );
  res.json({ success: true, data: payout });
});

export const listValidators = [validate(adminPayoutListQuerySchema, "query")];
export const rejectValidators = [validate(rejectPayoutSchema)];
export const markPaidValidators = [validate(markPaidPayoutSchema)];
