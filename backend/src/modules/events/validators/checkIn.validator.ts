import { z } from "zod";

export const scanCheckInSchema = z.object({
  qrPayload: z.string().min(1),
  deviceId: z.string().optional(),
});

export const manualCheckInSchema = z.object({
  ticketNumber: z.string().min(1),
});

export const searchCheckInQuerySchema = z.object({
  q: z.string().min(2).max(120),
});

export const bulkSyncSchema = z.object({
  scans: z
    .array(
      z.object({
        qrPayload: z.string().min(1),
        deviceId: z.string().optional(),
        scannedAt: z.coerce.date().optional(),
      })
    )
    .min(1)
    .max(500),
});

export const checkInLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  segmentId: z.string().optional(),
  status: z.enum(["success", "already_checked_in", "invalid", "not_found"]).optional(),
});
