"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DynamicFormBuilder } from "@/components/organizer/dynamic-form-builder";
import { EventBuilderMediaTab } from "@/components/organizer/event-builder-media-tab";
import { EventBuilderUniversityTab } from "@/components/organizer/event-builder-university-tab";
import { EventPreviewPanel } from "@/components/organizer/event-preview-panel";
import { SegmentBuilder } from "@/components/organizer/segment-builder";
import { PromoCodeManager } from "@/components/organizer/promo/PromoCodeManager";
import type { TicketSegment } from "@/lib/forms/form-field-types";
import type { DynamicFormField } from "@/lib/forms/form-field-types";
import type { EventSponsor, EventUniversityInfo } from "@/types/models/university";

export type BuilderTab =
  | "basic"
  | "media"
  | "university"
  | "venue"
  | "segments"
  | "forms"
  | "promo"
  | "preview";

interface EventBuilderTabsProps {
  tab: BuilderTab;
  eventId?: string;
  title: string;
  shortDescription: string;
  coverImage: string;
  venueName: string;
  sections: TicketSegment[];
  formFields: DynamicFormField[];
  formEnabled: boolean;
  previewView: "desktop" | "mobile";
  university: EventUniversityInfo;
  sponsors: EventSponsor[];
  videoThumbnail: string;
  onTitle: (v: string) => void;
  onShortDescription: (v: string) => void;
  onDescription: (v: string) => void;
  onSlug: (v: string) => void;
  onCategory: (v: string) => void;
  description: string;
  slug: string;
  category: string;
  onVenueName: (v: string) => void;
  onVenueCity: (v: string) => void;
  venueCity: string;
  onSections: (s: TicketSegment[]) => void;
  onFormFields: (f: DynamicFormField[]) => void;
  onFormEnabled: (v: boolean) => void;
  onPreviewView: (v: "desktop" | "mobile") => void;
  onUniversity: (u: EventUniversityInfo) => void;
  onSponsors: (s: EventSponsor[]) => void;
  onCover: (v: string) => void;
  onVideo: (v: string) => void;
}

export function EventBuilderTabs(props: BuilderTab extends never ? never : EventBuilderTabsProps) {
  const { tab } = props;

  if (tab === "basic") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Title</Label>
          <Input value={props.title} onChange={(e) => props.onTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input value={props.slug} onChange={(e) => props.onSlug(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Input value={props.category} onChange={(e) => props.onCategory(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Short description</Label>
          <Input value={props.shortDescription} onChange={(e) => props.onShortDescription(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Description</Label>
          <textarea
            className="min-h-[120px] w-full rounded-lg border border-white/10 bg-[#12121e] px-4 py-2 text-sm"
            value={props.description}
            onChange={(e) => props.onDescription(e.target.value)}
          />
        </div>
      </div>
    );
  }

  if (tab === "media") {
    return (
      <EventBuilderMediaTab
        coverImage={props.coverImage}
        videoThumbnail={props.videoThumbnail}
        onCover={props.onCover}
        onVideo={props.onVideo}
      />
    );
  }

  if (tab === "university") {
    return (
      <EventBuilderUniversityTab
        university={props.university}
        sponsors={props.sponsors}
        onUniversity={props.onUniversity}
        onSponsors={props.onSponsors}
      />
    );
  }

  if (tab === "venue") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Venue name</Label>
          <Input value={props.venueName} onChange={(e) => props.onVenueName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input value={props.venueCity} onChange={(e) => props.onVenueCity(e.target.value)} />
        </div>
      </div>
    );
  }

  if (tab === "segments") return <SegmentBuilder segments={props.sections} onChange={props.onSections} />;

  if (tab === "promo" && props.eventId) {
    return <PromoCodeManager eventId={props.eventId} />;
  }

  if (tab === "forms") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Event-wide form (fallback). Per-segment forms are configured under Ticket Segments.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={props.formEnabled} onChange={(e) => props.onFormEnabled(e.target.checked)} />
          Enable global registration form
        </label>
        {props.formEnabled && (
          <DynamicFormBuilder fields={props.formFields} onChange={props.onFormFields} />
        )}
      </div>
    );
  }

  return (
    <EventPreviewPanel
      title={props.title}
      shortDescription={props.shortDescription}
      coverImage={props.coverImage}
      segments={props.sections}
      venueName={props.venueName}
      view={props.previewView}
      onViewChange={props.onPreviewView}
    />
  );
}
