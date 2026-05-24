import { z } from "zod";

export const scanCheckInSchema = z.object({ qrData: z.string().min(1), eventId: z.string().optional() });
export const manualCheckInSchema = z.object({ ticketNumber: z.string().min(1), eventId: z.string().min(1) });
export const checkInStatsQuerySchema = z.object({ eventId: z.string().min(1) });
