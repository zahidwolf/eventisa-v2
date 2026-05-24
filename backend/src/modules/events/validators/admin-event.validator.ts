import { z } from "zod";
import { SegmentStatus } from "@/modules/events/models/ticket-section.schema.js";
import {
  ticketSegmentSchema,
  eventCustomFormSchema,
} from "@/modules/forms/validators/form-field.validator.js";

export const rejectEventSchema = z.object({
  reason: z.string().min(3).max(500).optional(),
});

export const requestChangesSchema = z.object({
  message: z.string().min(3).max(1000),
});

export const moderationSchema = z.object({
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  homepagePriority: z.number().int().min(0).optional(),
  listingRank: z.number().int().min(0).optional(),
});

export const adminSegmentOverrideSchema = z.object({
  ticketSections: z.array(ticketSegmentSchema).optional(),
  customForm: eventCustomFormSchema.optional(),
  forceSegmentStatus: z
    .array(
      z.object({
        sectionId: z.string().min(1),
        status: z.nativeEnum(SegmentStatus),
        isVisible: z.boolean().optional(),
      })
    )
    .optional(),
});
