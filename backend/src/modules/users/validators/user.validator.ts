import { z } from "zod";

export const patchUserProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z.string().max(20).optional(),
  dateOfBirth: z.string().date().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say", ""]).optional(),
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

export const listTicketsQuerySchema = z.object({
  status: z.enum(["all", "upcoming", "past", "cancelled"]).optional(),
  search: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const listOrdersQuerySchema = z.object({
  status: z.enum(["all", "paid", "cancelled", "refunded"]).optional(),
  search: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
