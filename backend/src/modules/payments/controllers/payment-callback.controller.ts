import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { handleProviderCallback } from "@/modules/payments/services/payment-callback.service.js";
import { env } from "@/config/env.js";

function redirectSuccess(orderId?: string) {
  const q = orderId ? `?orderId=${encodeURIComponent(orderId)}` : "";
  return `${env.CLIENT_URL}/checkout/payment/success${q}`;
}

export const sslcommerzCallback = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await handleProviderCallback("sslcommerz", req.body as Record<string, unknown>);
    const orderId = result.order?.orderId;
    res.redirect(redirectSuccess(orderId));
  } catch {
    res.redirect(`${env.CLIENT_URL}/checkout/payment/failed`);
  }
});

export const bkashCallback = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await handleProviderCallback("bkash", {
      ...(req.body as Record<string, unknown>),
      ...(req.query as Record<string, unknown>),
    });
    res.redirect(redirectSuccess(result.order?.orderId));
  } catch {
    res.redirect(`${env.CLIENT_URL}/checkout/payment/failed`);
  }
});

export const nagadCallback = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await handleProviderCallback("nagad", req.body as Record<string, unknown>);
    res.redirect(redirectSuccess(result.order?.orderId));
  } catch {
    res.redirect(`${env.CLIENT_URL}/checkout/payment/failed`);
  }
});
