import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * Reusable metadata factory for App Router pages.
 */
export function createPageMetadata(overrides: Partial<Metadata> = {}): Metadata {
  return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [...siteConfig.keywords],
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.name,
      description: siteConfig.description,
    },
    ...overrides,
  };
}
