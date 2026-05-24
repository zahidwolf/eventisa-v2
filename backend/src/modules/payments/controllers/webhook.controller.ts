import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";

/**
 * TODO: SSLCommerz IPN — validate store credentials, verify val_id, call verifyPaymentAndFulfill
 * Docs: https://developer.sslcommerz.com/doc/v4/
 */
export const sslcommerzWebhook = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "SSLCommerz webhook not implemented — add credentials and IPN handler",
    code: "NOT_IMPLEMENTED",
  });
});

/**
 * TODO: bKash callback — verify signature, query payment status, fulfill order
 */
export const bkashWebhook = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "bKash webhook not implemented",
    code: "NOT_IMPLEMENTED",
  });
});

/**
 * TODO: Nagad callback — decrypt sensitive data, verify payment reference
 */
export const nagadWebhook = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "Nagad webhook not implemented",
    code: "NOT_IMPLEMENTED",
  });
});
