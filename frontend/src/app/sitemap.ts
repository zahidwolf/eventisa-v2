import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { BD_CITIES, EVENT_CATEGORIES } from "@/lib/events/event-utils";
import { fetchPublishedEventSlugs } from "@/lib/seo/sitemap-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/events`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/search`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const cityRoutes = BD_CITIES.map((city) => ({
    url: `${base}/events?city=${encodeURIComponent(city)}`,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const categoryRoutes = EVENT_CATEGORIES.map((cat) => ({
    url: `${base}/events?category=${encodeURIComponent(cat)}`,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));

  const events = await fetchPublishedEventSlugs();
  const eventRoutes = events.map((e) => ({
    url: `${base}/event/${e.slug}`,
    lastModified: new Date(e.startDate),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...cityRoutes, ...categoryRoutes, ...eventRoutes];
}
