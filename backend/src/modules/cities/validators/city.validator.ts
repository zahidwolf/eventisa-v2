import { z } from "zod";

const cityFields = {
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).optional(),
  image: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
};

export const createCitySchema = z.object(cityFields);

export const updateCitySchema = z.object(cityFields).partial();
