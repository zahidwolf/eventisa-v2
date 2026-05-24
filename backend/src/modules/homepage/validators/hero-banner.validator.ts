import { z } from "zod";

const heroBannerFields = {
  imageUrl: z.string().min(1),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(500).optional(),
  ctaText: z.string().max(80).optional(),
  ctaLink: z.string().max(500).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
};

export const createHeroBannerSchema = z.object(heroBannerFields);

export const updateHeroBannerSchema = z.object(heroBannerFields).partial();
