import { siteConfig } from "@/config/site";
import { getLowestPrice } from "@/lib/events/event-utils";
import type { EventDetail } from "@/types/models/event";

export function EventJsonLd({ event }: { event: EventDetail }) {
  const price = getLowestPrice(event.ticketSections);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.venue.city,
        addressCountry: event.venue.country ?? "BD",
      },
    },
    image: event.coverImage ? [event.coverImage] : undefined,
    organizer: {
      "@type": "Organization",
      name: event.organizer.businessName,
      url: `${siteConfig.url}/organizers/${event.organizer.slug}`,
    },
    offers: price
      ? {
          "@type": "Offer",
          price,
          priceCurrency: "BDT",
          availability: "https://schema.org/InStock",
          url: `${siteConfig.url}/event/${event.slug}`,
        }
      : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
