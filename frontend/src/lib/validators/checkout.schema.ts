import { z } from "zod";

const bdPhone = /^01[3-9]\d{8}$/;

export const guestCheckoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().regex(bdPhone, "Valid Bangladesh mobile (01XXXXXXXXX)"),
  studentId: z.string().max(50).optional(),
});

export type GuestCheckoutForm = z.infer<typeof guestCheckoutSchema>;
