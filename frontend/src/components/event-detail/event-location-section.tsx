import { MapPin, ExternalLink } from "lucide-react";
import type { EventDetail } from "@/types/models/event";

export function EventLocationSection({ event }: { event: EventDetail }) {
  const { venue } = event;
  const mapQuery = encodeURIComponent(`${venue.name}, ${venue.city}, Bangladesh`);
  const mapHref = venue.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-bold">Location</h2>
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/7] bg-surface-card">
          <iframe
            title={`Map of ${venue.name}`}
            className="absolute inset-0 h-full w-full border-0 grayscale-[30%] contrast-125"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-primary-neon" />
            <div>
              <p className="font-semibold">{venue.name}</p>
              <p className="text-sm text-zinc-500">
                {venue.address ? `${venue.address}, ` : ""}
                {venue.city}, {venue.country}
              </p>
            </div>
          </div>
          <a
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary-neon hover:underline"
          >
            Open in Maps
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
