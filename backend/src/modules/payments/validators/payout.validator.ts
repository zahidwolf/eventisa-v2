import { z } from "zod";
import { PayoutStatus } from "@/modules/payments/types/payout.types.js";

export const createPayoutSchema = z.object({
  eventIds: z.array(z.string().min(1)).min(1),
  requestNote: z.string().max(500).optional(),
});

export const payoutListQuerySchema = z.object({
  status: z.nativeEnum(PayoutStatus).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const adminPayoutListQuerySchema = payoutListQuerySchema.extend({
  organizerId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const rejectPayoutSchema = z.object({
  reason: z.string().min(1).max(500),
});

export const markPaidPayoutSchema = z.object({
  txRef: z.string().min(1).max(200),
  paymentMethod: z.string().min(1).max(80),
  paymentNote: z.string().max(500).optional(),
});
