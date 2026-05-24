import { z } from "zod";

export const setFeaturedEventsSchema = z.object({
  featuredEventIds: z.array(z.string().min(1)).max(24),
});

export const setTrendingEventsSchema = z.object({
  trendingEventIds: z.array(z.string().min(1)).max(24),
});

export const updateHomepageConfigSchema = z.object({
  featuredEventIds: z.array(z.string().min(1)).max(24).optional(),
  trendingEventIds: z.array(z.string().min(1)).max(24).optional(),
  heroBanners: z
    .array(
      z.object({
        title: z.string().min(1),
        subtitle: z.string().optional(),
        imageUrl: z.string().min(1),
        ctaLabel: z.string().optional(),
        ctaHref: z.string().optional(),
        order: z.number().int().min(0),
        active: z.boolean(),
      })
    )
    .optional(),
  categoryVisibility: z
    .array(z.object({ slug: z.string(), visible: z.boolean(), order: z.number().int() }))
    .optional(),
});
