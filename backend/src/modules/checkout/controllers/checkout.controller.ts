import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { completeCheckout } from "@/modules/checkout/services/checkout.service.js";
import { MockPaymentOutcome } from "@/modules/payments/types/payment.types.js";

export const complete = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, sessionId, paymentMethod, paymentId, outcome } = req.body;

  const result = await completeCheckout(
    orderId,
    sessionId,
    paymentMethod,
    paymentId,
    outcome as MockPaymentOutcome | undefined
  );

  res.json({
    success: true,
    data: {
      payment: "payment" in result ? result.payment : undefined,
      order: result.order,
      tickets: "tickets" in result ? result.tickets : [],
    },
    message: "Payment confirmed and tickets issued",
  });
});
