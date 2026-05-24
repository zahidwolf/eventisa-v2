import { z } from "zod";

export const createTeamMemberSchema = z.object({
  name: z.string().min(2).max(120),
  designation: z.string().min(2).max(120),
  description: z.string().min(10).max(500),
  imageUrl: z.string().min(1),
  imagePublicId: z.string().optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updateTeamMemberSchema = createTeamMemberSchema.partial();
