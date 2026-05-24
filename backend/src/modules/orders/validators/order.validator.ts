import { z } from "zod";

const bdPhoneRegex = /^01[3-9]\d{8}$/;

export const reserveOrderSchema = z.object({
  eventId: z.string().min(1),
  sectionId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
  sessionId: z.string().min(8),
});

export const createOrderSchema = z.object({
  reservationId: z.string().min(1),
  sessionId: z.string().min(8),
  guest: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().regex(bdPhoneRegex, "Enter valid Bangladesh mobile (01XXXXXXXXX)"),
    studentId: z.string().max(50).optional(),
  }),
  customFormResponses: z
    .array(
      z.object({
        fieldKey: z.string(),
        value: z.union([z.string(), z.array(z.string()), z.boolean(), z.number()]),
      })
    )
    .default([]),
  coupon: z.string().optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(200).optional(),
});

export const cancelOrderSchema = z.object({
  sessionId: z.string().min(8),
});

export const confirmFreeOrderSchema = z.object({
  sessionId: z.string().min(8),
});

export type ReserveOrderInput = z.infer<typeof reserveOrderSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
