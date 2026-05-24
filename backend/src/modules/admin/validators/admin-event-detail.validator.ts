import { z } from "zod";
import { SegmentStatus, SegmentVisibility } from "@/modules/events/models/ticketSegment.model.js";

export const adminSegmentUpdateSchema = z.object({
  status: z.nativeEnum(SegmentStatus).optional(),
  capacity: z.number().int().min(1).optional(),
  isVisible: z.boolean().optional(),
  visibility: z.nativeEnum(SegmentVisibility).optional(),
});

export const adminBookingActionSchema = z.object({
  reason: z.string().min(3).max(500).optional(),
});
