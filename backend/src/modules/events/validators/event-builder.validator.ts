import { z } from "zod";
import { SegmentStatus } from "@/modules/events/models/ticket-section.schema.js";

const conditionalLogicSchema = z.object({
  dependsOn: z.string().min(1),
  operator: z.string(),
  value: z.union([z.string(), z.boolean(), z.number()]).optional(),
  action: z.enum(["show", "hide", "require", "unrequire"]),
});

const validationSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  regex: z.string().optional(),
  regexMessage: z.string().optional(),
  allowedFileTypes: z.array(z.string()).optional(),
  maxFileSizeMB: z.number().optional(),
});

export const formFieldBodySchema = z.object({
  fieldId: z.string().optional(),
  type: z.string(),
  label: z.string().min(1),
  placeholder: z.string().optional(),
  helperText: z.string().optional(),
  required: z.boolean().optional(),
  hidden: z.boolean().optional(),
  readonly: z.boolean().optional(),
  defaultValue: z.string().optional(),
  options: z.array(z.string()).optional(),
  validation: validationSchema.optional(),
  conditionalLogic: conditionalLogicSchema.optional(),
  order: z.number().optional(),
});

export const segmentBodySchema = z.object({
  segmentId: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  isFree: z.boolean().optional(),
  capacity: z.number().min(1).optional(),
  remainingQuantity: z.number().min(0).optional(),
  maxPurchasePerUser: z.number().min(1).optional(),
  minPurchase: z.number().min(1).optional(),
  saleStart: z.coerce.date().optional(),
  saleEnd: z.coerce.date().optional(),
  visibility: z.enum(["public", "hidden", "unlisted"]).optional(),
  ticketColor: z.string().optional(),
  status: z.nativeEnum(SegmentStatus).optional(),
  formEnabled: z.boolean().optional(),
  formFields: z.array(formFieldBodySchema).optional(),
});

export const reorderSegmentsSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export const reorderFieldsSchema = z.object({
  orderedFieldIds: z.array(z.string().min(1)).min(1),
});

export const forceStatusSchema = z.object({
  status: z.nativeEnum(SegmentStatus),
});

export const validateSubmissionSchema = z.object({
  segmentId: z.string().nullable().optional(),
  answers: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])),
});
