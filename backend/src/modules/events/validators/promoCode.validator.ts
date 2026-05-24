import { z } from "zod";
import { PromoCodeType } from "@/modules/events/models/promoCode.model.js";

export const createPromoCodeSchema = z.object({
  code: z.string().trim().min(3).max(32).optional(),
  type: z.nativeEnum(PromoCodeType),
  value: z.number().positive(),
  maxUses: z.number().int().min(0).optional(),
  perUserLimit: z.number().int().min(1).optional(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  segmentIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const updatePromoCodeSchema = createPromoCodeSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: "At least one field required" });

export const validatePromoCodeSchema = z.object({
  code: z.string().trim().min(1),
  segmentId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});
