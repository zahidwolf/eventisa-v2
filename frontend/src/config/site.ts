import { env } from "@/config/env";

/**
 * SEO & metadata defaults (Bangladesh-focused ticketing platform).
 */
export const siteConfig = {
  name: env.appName,
  url: env.appUrl,
  description:
    "The premium destination for discovering and booking events in Bangladesh — concerts, conferences, festivals, sports, comedy, career fairs & more.",
  locale: env.locale,
  currency: env.currency,
  timezone: env.timezone,
  keywords: [
    "event tickets Bangladesh",
    "concert tickets Dhaka",
    "conference tickets BD",
    "festival tickets",
    "online ticketing Bangladesh",
  ],
  tagline: "Discover Bangladesh's best events",
  links: {
    twitter: "",
    facebook: "",
    instagram: "",
  },
} as const;
