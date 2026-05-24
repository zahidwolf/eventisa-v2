import { z } from "zod";
import { FormFieldType } from "@/modules/forms/types/form-field.types.js";
import { SegmentStatus } from "@/modules/events/models/ticket-section.schema.js";

export const formFieldConditionSchema = z.object({
  fieldKey: z.string().min(1),
  operator: z.enum(["equals", "not_equals", "contains", "checked"]).default("equals"),
  value: z.union([z.string(), z.boolean()]).optional(),
});

export const formFieldValidationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  patternMessage: z.string().optional(),
});

export const formFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.nativeEnum(FormFieldType),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
  defaultValue: z.string().optional(),
  options: z.array(z.string()).optional(),
  order: z.number().default(0),
  hidden: z.boolean().default(false),
  readonly: z.boolean().default(false),
  validation: formFieldValidationSchema.optional(),
  showWhen: formFieldConditionSchema.optional(),
});

export const ticketSegmentSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().max(500).optional(),
    price: z.number().min(0),
    isFree: z.boolean().default(false),
    capacity: z.number().int().min(1),
    maxPurchase: z.number().int().min(1).default(10),
    minPurchase: z.number().int().min(1).default(1),
    benefits: z.array(z.string()).default([]),
    isVisible: z.boolean().default(true),
    saleStart: z.coerce.date().optional(),
    saleEnd: z.coerce.date().optional(),
    status: z.nativeEnum(SegmentStatus).default(SegmentStatus.Active),
    seatType: z.string().optional(),
    ticketColor: z.string().optional(),
    formEnabled: z.boolean().default(false),
    formFields: z.array(formFieldSchema).default([]),
  })
  .superRefine((seg, ctx) => {
    if (seg.isFree && seg.price > 0) {
      ctx.addIssue({ code: "custom", message: "Free segments must have price 0", path: ["price"] });
    }
    if (seg.minPurchase > seg.maxPurchase) {
      ctx.addIssue({ code: "custom", message: "minPurchase cannot exceed maxPurchase", path: ["minPurchase"] });
    }
  });

export const eventCustomFormSchema = z.object({
  enabled: z.boolean(),
  fields: z.array(formFieldSchema),
});
