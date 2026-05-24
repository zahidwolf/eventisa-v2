import { z } from "zod";
import { MockPaymentOutcome } from "@/modules/payments/types/payment.types.js";

export const completeCheckoutSchema = z.object({
  orderId: z.string().min(1),
  sessionId: z.string().min(8),
  paymentMethod: z.string().optional(),
  paymentId: z.string().optional(),
  outcome: z.nativeEnum(MockPaymentOutcome).optional(),
});
