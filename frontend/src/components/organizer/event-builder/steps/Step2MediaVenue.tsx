"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImageUpload } from "@/components/media/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BD_CITIES } from "@/lib/events/event-utils";
import { fetchPublicCities, fetchPublicVenues } from "@/services/public/catalog.service";
import type { EventWizardState, OnlinePlatform } from "@/components/organizer/event-builder/wizard.types";

interface Step2MediaVenueProps {
  state: EventWizardState;
  errors: Record<string, string>;
  onChange: (patch: Partial<EventWizardState>) => void;
  onCoverUploaded?: (url: string) => void;
}

const PLATFORMS: OnlinePlatform[] = ["Zoom", "Google Meet", "YouTube", "Other"];

export function Step2MediaVenue({ state, errors, onChange, onCoverUploaded }: Step2MediaVenueProps) {
  const showVenue = state.eventFormat === "in-person" || state.eventFormat === "hybrid";
  const showOnline = state.eventFormat === "online" || state.eventFormat === "hybrid";

  const { data: cities = [] } = useQuery({
    queryKey: ["public-cities"],
    queryFn: fetchPublicCities,
    staleTime: 5 * 60_000,
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["public-venues", state.venueCity],
    queryFn: () => fetchPublicVenues(state.venueCity),
    enabled: showVenue,
    staleTime: 5 * 60_000,
  });

  const cityOptions = useMemo(
    () => (cities.length ? cities.map((c) => c.name) : BD_CITIES),
    [cities]
  );

  const applySavedVenue = (venueId: string) => {
    if (!venueId) return;
    const venue = venues.find((v) => v._id === venueId);
    if (!venue) return;
    onChange({
      venueName: venue.name,
      venueAddress: venue.address ?? "",
      venueCity: venue.city,
      mapUrl: venue.googleMapsUrl ?? "",
    });
  };

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Media</h3>
        <ImageUpload
          label="Banner image *"
          folder="events/banners"
          aspectRatio="banner"
          value={state.coverImage}
          onChange={(v) => {
            onChange({ coverImage: v });
            if (v) onCoverUploaded?.(v);
          }}
        />
        <p className="text-xs text-zinc-500">Recommended size: 1200×630px</p>
        {errors.coverImage && <p className="text-xs text-red-400">{errors.coverImage}</p>}
      </section>

      {showVenue && (
        <section className="space-y-4 border-t border-white/10 pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Venue</h3>
          {venues.length > 0 && (
            <div className="space-y-2">
              <Label>Pick saved venue</Label>
              <select
                className="flex h-11 w-full rounded-lg border border-white/10 bg-[#070B1A] px-3 text-sm"
                defaultValue=""
                onChange={(e) => applySavedVenue(e.target.value)}
              >
                <option value="">Choose from directory…</option>
                {venues.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} — {v.city}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Venue name</Label>
            <Input
              value={state.venueName}
              onChange={(e) => onChange({ venueName: e.target.value })}
              placeholder="Venue or hall name"
              className="border-white/10 bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label>Full address</Label>
            <Input
              value={state.venueAddress}
              onChange={(e) => onChange({ venueAddress: e.target.value })}
              placeholder="Street, area"
              className="border-white/10 bg-white/5"
            />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <select
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#070B1A] px-3 text-sm"
              value={state.venueCity}
              onChange={(e) => onChange({ venueCity: e.target.value })}
            >
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Google Maps embed URL <span className="text-zinc-500">(optional)</span></Label>
            <Input
              value={state.mapUrl}
              onChange={(e) => onChange({ mapUrl: e.target.value })}
              placeholder="https://maps.google.com/…"
              className="border-white/10 bg-white/5"
            />
          </div>
        </section>
      )}

      {showOnline && (
        <section className="space-y-4 border-t border-white/10 pt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Online</h3>
          <div className="space-y-2">
            <Label>Platform</Label>
            <select
              className="flex h-11 w-full rounded-lg border border-white/10 bg-[#070B1A] px-3 text-sm"
              value={state.onlinePlatform}
              onChange={(e) => onChange({ onlinePlatform: e.target.value as OnlinePlatform })}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Stream URL or meeting link</Label>
            <Input
              value={state.streamUrl}
              onChange={(e) => onChange({ streamUrl: e.target.value })}
              placeholder="https://zoom.us/j/…"
              className="border-white/10 bg-white/5"
            />
          </div>
        </section>
      )}
    </div>
  );
}
