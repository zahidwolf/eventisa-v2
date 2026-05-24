import { z } from "zod";

export const registerOrganizerSchema = z.object({
  organizationName: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladesh mobile number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain a number"),
});

export type RegisterOrganizerInput = z.infer<typeof registerOrganizerSchema>;

const socialLinksSchema = z
  .object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
  })
  .optional();

export const createOrganizerSchema = z.object({
  businessName: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  phone: z.string().min(10).max(15),
  email: z.string().email(),
  description: z.string().max(2000).optional(),
  socialLinks: socialLinksSchema,
});

export const updateOrganizerSchema = createOrganizerSchema.partial();

export type CreateOrganizerInput = z.infer<typeof createOrganizerSchema>;
