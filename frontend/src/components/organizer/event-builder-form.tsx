"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EventBuilderTabs, type BuilderTab } from "@/components/organizer/event-builder-tabs";
import type { FormField, TicketSection } from "@/types/models/event";
import type { TicketSegment } from "@/lib/forms/form-field-types";
import type { EventSponsor, EventUniversityInfo } from "@/types/models/university";

function normalizeSection(s: Partial<TicketSection> & { title: string; price: number; capacity: number }): TicketSegment {
  return {
    title: s.title,
    price: s.price,
    isFree: s.isFree ?? s.price === 0,
    capacity: s.capacity,
    quantitySold: s.quantitySold ?? 0,
    maxPurchase: s.maxPurchase ?? 10,
    minPurchase: s.minPurchase ?? 1,
    benefits: s.benefits ?? [],
    isVisible: s.isVisible ?? true,
    description: s.description,
    status: s.status ?? "active",
    formEnabled: s.formEnabled ?? false,
    formFields: s.formFields ?? [],
    ticketColor: s.ticketColor,
    seatType: s.seatType,
  };
}

interface EventBuilderFormProps {
  eventId?: string;
  initial?: {
    title?: string;
    slug?: string;
    shortDescription?: string;
    description?: string;
    category?: string;
    coverImage?: string;
    venue?: { name: string; city: string; country: string };
    ticketSections?: TicketSection[];
    customForm?: { enabled: boolean; fields: FormField[] };
  };
  onSubmit: (data: Record<string, unknown>) => void;
  onSubmitForReview?: () => void;
  loading?: boolean;
}

export function EventBuilderForm({
  eventId,
  initial,
  onSubmit,
  onSubmitForReview,
  loading,
}: EventBuilderFormProps) {
  const [tab, setTab] = useState<BuilderTab>("basic");
  const [previewView, setPreviewView] = useState<"desktop" | "mobile">("desktop");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Concert");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [university, setUniversity] = useState<EventUniversityInfo>({});
  const [sponsors, setSponsors] = useState<EventSponsor[]>([]);
  const [venueName, setVenueName] = useState(initial?.venue?.name ?? "");
  const [venueCity, setVenueCity] = useState(initial?.venue?.city ?? "Dhaka");
  const [sections, setSections] = useState<TicketSegment[]>(
    (initial?.ticketSections?.length
      ? initial.ticketSections
      : [
          { title: "VIP", price: 3000, capacity: 100, maxPurchase: 4, isVisible: true },
          { title: "Regular", price: 1200, capacity: 500, maxPurchase: 10, isVisible: true },
        ]
    ).map(normalizeSection)
  );
  const [formFields, setFormFields] = useState(initial?.customForm?.fields ?? []);
  const [formEnabled, setFormEnabled] = useState(initial?.customForm?.enabled ?? false);
  const tabs: { id: BuilderTab; label: string }[] = [
    { id: "basic", label: "Basic Info" },
    { id: "media", label: "Media" },
    { id: "university", label: "Campus & extras" },
    { id: "venue", label: "Venue" },
    { id: "segments", label: "Ticket Segments" },
    { id: "forms", label: "Custom Forms" },
    ...(eventId ? [{ id: "promo" as const, label: "Promo Codes" }] : []),
    { id: "preview", label: "Preview" },
  ];

  const buildPayload = () => {
    const start = new Date();
    start.setDate(start.getDate() + 14);
    const end = new Date(start);
    end.setHours(end.getHours() + 4);

    return {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
      shortDescription,
      description,
      category,
      coverImage: coverImage || undefined,
      videoThumbnail: videoThumbnail || undefined,
      university,
      sponsors,
      venue: { name: venueName, city: venueCity, country: "Bangladesh" },
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      ticketSections: sections.map((s) => ({
        title: s.title,
        description: s.description,
        price: s.isFree ? 0 : s.price,
        isFree: s.isFree,
        capacity: s.capacity,
        maxPurchase: s.maxPurchase,
        minPurchase: s.minPurchase ?? 1,
        benefits: s.benefits,
        isVisible: s.isVisible,
        status: s.status ?? "active",
        seatType: s.seatType,
        ticketColor: s.ticketColor,
        formEnabled: s.formEnabled,
        formFields: s.formFields,
        saleStart: s.saleStart,
        saleEnd: s.saleEnd,
      })),
      capacity: sections.reduce((sum, x) => sum + x.capacity, 0),
      customForm: { enabled: formEnabled, fields: formFields },
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map((t) => (
          <Button
            key={t.id}
            type="button"
            variant={tab === t.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <EventBuilderTabs
        tab={tab}
        eventId={eventId}
        title={title}
        slug={slug}
        category={category}
        description={description}
        shortDescription={shortDescription}
        coverImage={coverImage}
        venueName={venueName}
        venueCity={venueCity}
        sections={sections}
        formFields={formFields}
        formEnabled={formEnabled}
        previewView={previewView}
        university={university}
        sponsors={sponsors}
        videoThumbnail={videoThumbnail}
        onTitle={setTitle}
        onSlug={setSlug}
        onCategory={setCategory}
        onDescription={setDescription}
        onShortDescription={setShortDescription}
        onVenueName={setVenueName}
        onVenueCity={setVenueCity}
        onSections={setSections}
        onFormFields={setFormFields}
        onFormEnabled={setFormEnabled}
        onPreviewView={setPreviewView}
        onUniversity={setUniversity}
        onSponsors={setSponsors}
        onCover={setCoverImage}
        onVideo={setVideoThumbnail}
      />

      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
        <Button type="button" disabled={loading} onClick={() => onSubmit(buildPayload())}>
          Save draft
        </Button>
        {onSubmitForReview && (
          <Button type="button" variant="secondary" disabled={loading} onClick={onSubmitForReview}>
            Submit for approval
          </Button>
        )}
      </div>
    </div>
  );
}
