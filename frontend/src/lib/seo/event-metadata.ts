import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { toPublicAssetUrl } from "@/lib/media/resolve-upload-url";
import type { EventDetail } from "@/types/models/event";
import { getLowestPrice } from "@/lib/events/event-utils";

export function createEventMetadata(event: EventDetail): Metadata {
  const price = getLowestPrice(event.ticketSections);
  const title = event.seo?.title ?? `${event.title} — ${event.venue.city}`;
  const description =
    event.seo?.description ??
    `${event.shortDescription} · ${event.venue.name}, ${event.city}. ${price ? `Tickets from ৳${price}.` : ""}`;

  const ogImage =
    toPublicAssetUrl(event.coverImage, siteConfig.url) ?? `${siteConfig.url}/opengraph-image`;

  return {
    title,
    description,
    keywords: event.seo?.keywords ?? [event.category, event.city, "tickets", "Bangladesh"],
    alternates: {
      canonical: `/event/${event.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Eventisa",
      url: `${siteConfig.url}/event/${event.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: event.title }],
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
