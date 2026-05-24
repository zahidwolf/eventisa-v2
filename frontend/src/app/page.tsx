import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";
import { fetchHomeEvents, partitionHomeEvents } from "@/lib/home/fetch-home-events";
import { fetchOrganizerShowcaseServer } from "@/lib/home/fetch-organizer-showcase";
import { fetchCuratedFeaturedEvents } from "@/lib/home/fetch-featured-events";
import { fetchCuratedTrendingEvents } from "@/lib/home/fetch-homepage-data";
import { HeroSection } from "@/components/home/hero-section";
import OfferingsSection from "@/components/home/OfferingsSection";
import { FeaturedEventsSection } from "@/components/home/featured-events-section";
import { TrendingEventsSection } from "@/components/home/trending-events-section";
import { UpcomingWeekSection } from "@/components/home/upcoming-week-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { OrganizerShowcase } from "@/components/home/OrganizerShowcase";
import { CtaSection } from "@/components/home/cta-section";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Eventisa — Bangladesh's Premier Event Platform",
  description:
    "Discover and book tickets for concerts, festivals, workshops, and more in Bangladesh.",
  openGraph: {
    title: "Eventisa — Bangladesh's Premier Event Platform",
    description:
      "Discover and book tickets for concerts, festivals, workshops, and more in Bangladesh.",
    images: [{ url: `${siteConfig.url}/opengraph-image`, width: 1200, height: 630, alt: "Eventisa" }],
  },
  twitter: {
    images: [`${siteConfig.url}/opengraph-image`],
  },
});

export default async function HomePage() {
  const [events, organizers, curatedFeatured, curatedTrending] = await Promise.all([
    fetchHomeEvents(),
    fetchOrganizerShowcaseServer(),
    fetchCuratedFeaturedEvents(),
    fetchCuratedTrendingEvents(),
  ]);
  const parts = partitionHomeEvents(events, curatedFeatured, curatedTrending);

  return (
    <>
      <OrganizationJsonLd />
      <HeroSection events={parts.featured} />
      <CategoriesSection />
      <TrendingEventsSection events={parts.trending} />
      <FeaturedEventsSection events={parts.featured} />
      <OrganizerShowcase organizers={organizers} />
      <UpcomingWeekSection events={parts.thisWeek} />
      <OfferingsSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
