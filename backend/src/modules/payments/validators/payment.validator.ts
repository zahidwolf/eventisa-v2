import { z } from "zod";
import { MockPaymentOutcome, PaymentMethod } from "@/modules/payments/types/payment.types.js";

export const initializePaymentSchema = z.object({
  orderId: z.string().min(1),
  sessionId: z.string().min(8),
  method: z.nativeEnum(PaymentMethod),
});

export const verifyPaymentSchema = z.object({
  paymentId: z.string().min(1),
  sessionId: z.string().min(8),
  outcome: z.nativeEnum(MockPaymentOutcome).optional(),
});

export const simulateMockSchema = z.object({
  paymentId: z.string().min(1),
  sessionId: z.string().min(8),
  outcome: z.nativeEnum(MockPaymentOutcome).default(MockPaymentOutcome.Success),
});
