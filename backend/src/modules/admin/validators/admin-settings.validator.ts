import { z } from "zod";

export const patchPlatformSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  tagline: z.string().max(200).optional(),
  supportEmail: z.string().email().optional(),
  supportPhone: z.string().max(30).optional().nullable(),
  websiteUrl: z.string().url().optional(),
  socialLinks: z
    .object({
      facebook: z.string().optional().nullable(),
      instagram: z.string().optional().nullable(),
      twitter: z.string().optional().nullable(),
    })
    .optional(),
  maintenanceMode: z.boolean().optional(),
  maintenanceConfirm: z.string().optional(),
});

export const patchFeesSchema = z.object({
  serviceFeePercent: z.number().min(0).max(20).optional(),
  minimumPayoutAmount: z.number().min(0).optional(),
  payoutProcessingDays: z.number().min(1).max(90).optional(),
  autoApprovePayoutsUnder: z.number().min(0).optional(),
});

export const patchEventControlsSchema = z.object({
  requireApproval: z.boolean().optional(),
  maxSegmentsPerEvent: z.number().int().min(1).max(50).optional(),
  maxTicketsPerUserPerEvent: z.number().int().min(1).max(100).optional(),
  autoExpireEvents: z.boolean().optional(),
  minNoticePeriodHours: z.number().int().min(0).max(720).optional(),
  maxEventDurationDays: z.number().int().min(1).max(365).optional(),
  enabledCategories: z.array(z.string()).optional(),
});

export const patchOrganizerControlsSchema = z.object({
  requireApproval: z.boolean().optional(),
  autoApproveVerified: z.boolean().optional(),
  maxActiveEventsPerOrganizer: z.number().int().min(0).optional(),
  maxFreeEventsPerMonth: z.number().int().min(0).optional(),
  useGlobalFee: z.boolean().optional(),
  welcomeMessage: z.string().max(2000).optional(),
});

export const patchSecuritySchema = z.object({
  accessTokenExpiry: z.enum(["15m", "30m", "1h", "2h"]).optional(),
  refreshTokenExpiry: z.enum(["7d", "14d", "30d"]).optional(),
  maxLoginAttempts: z.number().int().min(3).max(20).optional(),
  lockoutDurationMinutes: z.number().int().min(5).max(1440).optional(),
  minPasswordLength: z.number().int().min(6).max(32).optional(),
  requireUppercase: z.boolean().optional(),
  requireNumber: z.boolean().optional(),
  requireSpecialChar: z.boolean().optional(),
  rateLimitPerMinute: z.number().int().min(10).max(1000).optional(),
  allowedOrigins: z.array(z.string()).optional(),
});

export const patchTrackingSchema = z.object({
  metaPixelId: z.string().max(64).optional(),
  googleAnalyticsId: z.string().max(32).optional(),
  googleTagManagerId: z.string().max(32).optional(),
});

export const inviteAdminSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  role: z.enum(["admin", "super_admin"]),
});

export const changeAdminRoleSchema = z.object({
  role: z.enum(["admin", "super_admin"]),
});
