import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { AppError } from "@/shared/errors/AppError.js";
import {
  getPaymentConfigForClient,
  getPaymentConfigForEvent,
  initializePaymentForOrder,
  verifyPaymentAndFulfill,
  getPaymentStatus,
} from "@/modules/payments/services/payment.service.js";
import {
  buildPaymentInitializeResponse,
  buildPaymentVerifyResponse,
} from "@/modules/orders/services/checkout-response.service.js";
import { PaymentRecordStatus } from "@/modules/payments/types/payment.types.js";

export const getConfig = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: getPaymentConfigForClient() });
});

export const getEventConfig = asyncHandler(async (req: Request, res: Response) => {
  const data = await getPaymentConfigForEvent(req.params.eventId as string);
  res.json({ success: true, data });
});

export const initialize = asyncHandler(async (req: Request, res: Response) => {
  const result = await initializePaymentForOrder(req.body);

  const data = await buildPaymentInitializeResponse({
    orderId: result.payment.orderRef,
    amount: result.payment.amount,
    redirectUrl: result.redirectUrl,
    eventId: result.eventId,
    provider: result.payment.provider,
    paymentId: result.payment.paymentId,
  });

  res.status(201).json({
    success: true,
    data,
    message: "Payment initialized",
  });
});

export const verify = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await verifyPaymentAndFulfill(req.body);
    const paid = result.payment.status === PaymentRecordStatus.Paid;
    const orderRef =
      result.order?.orderId ??
      (typeof req.body.orderId === "string" ? req.body.orderId : "");
    const data = buildPaymentVerifyResponse({
      success: paid,
      orderId: orderRef,
      status: paid ? "paid" : "failed",
      message: result.alreadyPaid ? "Order already fulfilled" : "Payment verified",
    });
    res.json({ success: true, data, message: data.message });
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 402) {
      res.json({
        success: true,
        data: buildPaymentVerifyResponse({
          success: false,
          orderId: "",
          status: "failed",
          message: err.message,
        }),
      });
      return;
    }
    throw err;
  }
});

export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const payment = await getPaymentStatus(
    req.params.paymentId as string,
    req.query.sessionId as string | undefined
  );

  res.json({
    success: true,
    data: {
      paymentId: payment.paymentId,
      status: payment.status,
      amount: payment.amount,
      orderRef: payment.orderRef,
    },
  });
});

export const simulateMock = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await verifyPaymentAndFulfill(req.body);
    const paid = result.payment.status === PaymentRecordStatus.Paid;
    const orderRef = result.order?.orderId ?? "";
    res.json({
      success: paid,
      data: buildPaymentVerifyResponse({
        success: paid,
        orderId: orderRef,
        status: paid ? "paid" : "failed",
        message: "Mock payment simulated",
      }),
    });
  } catch (err) {
    if (err instanceof AppError) {
      res.json({
        success: false,
        data: buildPaymentVerifyResponse({
          success: false,
          orderId: "",
          status: "failed",
          message: err.message,
        }),
      });
      return;
    }
    throw err;
  }
});
