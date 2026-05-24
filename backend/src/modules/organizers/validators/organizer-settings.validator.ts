import { z } from "zod";
import { OrganizationType, PayoutMethod } from "@/modules/organizers/types/organizer-settings.types.js";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const uploadPath = z.string().regex(/^\/api\/uploads\/files\/.+/);

const imageField = z
  .union([optionalUrl, uploadPath, z.string().regex(/^data:image\/(jpeg|jpg|png|webp);base64,/i)])
  .optional();

export const patchProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().min(6).max(20).optional(),
  bio: z.string().max(300).optional(),
  socialLinks: z
    .object({
      facebook: optionalUrl,
      instagram: optionalUrl,
      linkedin: optionalUrl,
      twitter: optionalUrl,
      youtube: optionalUrl,
      website: optionalUrl,
    })
    .partial()
    .optional(),
});

export const patchOrganizationSchema = z.object({
  businessName: z.string().min(2).max(120).optional(),
  organizationType: z.nativeEnum(OrganizationType).optional(),
  description: z.string().max(500).optional(),
  logo: imageField,
  coverPhoto: imageField,
  businessAddress: z.string().max(300).optional(),
  city: z.string().max(80).optional(),
  establishedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  licenseNumber: z.string().max(80).optional(),
});

export const patchNotificationPreferencesSchema = z.object({
  newBooking: z.boolean().optional(),
  bookingCancelled: z.boolean().optional(),
  eventApproved: z.boolean().optional(),
  eventRejected: z.boolean().optional(),
  payoutProcessed: z.boolean().optional(),
  payoutRejected: z.boolean().optional(),
  weeklySummary: z.boolean().optional(),
  dailyDigest: z.boolean().optional(),
});

export const patchBankingSchema = z.object({
  accountHolderName: z.string().min(2).max(120).optional(),
  bankName: z.string().min(2).max(120).optional(),
  accountNumber: z.string().min(4).max(40).optional(),
  branchName: z.string().max(120).optional(),
  routingNumber: z.string().max(40).optional(),
  bkashNumber: z.string().max(20).optional(),
  nagadNumber: z.string().max(20).optional(),
  rocketNumber: z.string().max(20).optional(),
  preferredPayoutMethod: z.nativeEnum(PayoutMethod).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .regex(/[0-9]/, "Must include a number")
      .regex(/[A-Z]/, "Must include uppercase"),
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from current",
    path: ["newPassword"],
  });

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE"),
});
