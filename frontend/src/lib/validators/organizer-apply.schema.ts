import { z } from "zod";

const phoneSchema = z
  .string()
  .min(1, "Phone is required")
  .regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladesh mobile number (01XXXXXXXXX)");

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

/** Full signup + apply (guest). */
export const organizerApplySignupSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required").max(200),
  email: z.string().email("Enter a valid email"),
  phone: phoneSchema,
  password: passwordSchema,
});

/** Apply only (already signed in). */
export const organizerApplyLoggedInSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required").max(200),
  email: z.string().email("Enter a valid email"),
  phone: phoneSchema,
});

export type OrganizerApplySignupData = z.infer<typeof organizerApplySignupSchema>;
export type OrganizerApplyLoggedInData = z.infer<typeof organizerApplyLoggedInSchema>;

export function slugifyOrganizationName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base.slice(0, 80) || "organizer";
}

export function toOrganizerApplyPayload(data: {
  organizationName: string;
  email: string;
  phone: string;
}) {
  return {
    businessName: data.organizationName.trim(),
    slug: slugifyOrganizationName(data.organizationName),
    phone: data.phone.trim(),
    email: data.email.trim().toLowerCase(),
  };
}
