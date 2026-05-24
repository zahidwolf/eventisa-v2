"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventBuilderMediaTab } from "@/components/organizer/event-builder-media-tab";
import { EventBuilderTabs } from "@/components/organizer/event-builder/EventBuilderTabs";
import { FormBuilder } from "@/components/organizer/event-builder/FormBuilder";
import { PreviewPanel } from "@/components/organizer/event-builder/PreviewPanel";
import { SegmentBuilder } from "@/components/organizer/event-builder/SegmentBuilder";
import { createDefaultSegment } from "@/components/organizer/event-builder/segmentDefaults";
import type { BuilderTabId, EventBuilderState, FormField, TicketSegment } from "@/types/eventBuilder.types";

interface EventBuilderLayoutProps {
  initial?: Partial<EventBuilderState>;
  onSaveDraft: (state: EventBuilderState) => void | Promise<void>;
  onPublish?: (state: EventBuilderState) => void | Promise<void>;
  saving?: boolean;
}

export function EventBuilderLayout({
  initial,
  onSaveDraft,
  onPublish,
  saving,
}: EventBuilderLayoutProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [activeTab, setActiveTab] = useState<BuilderTabId>(initial?.activeTab ?? "basic");
  const [dirtyTabs, setDirtyTabs] = useState<BuilderTabId[]>([]);
  const [segments, setSegments] = useState<TicketSegment[]>(
    initial?.segments?.length ? initial.segments : [createDefaultSegment()]
  );
  const [globalFormFields, setGlobalFormFields] = useState<FormField[]>(
    initial?.globalFormFields ?? []
  );
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [venueName, setVenueName] = useState(initial?.venueName ?? "");
  const [startDate, setStartDate] = useState(initial?.startDate ?? "");

  const markDirty = useCallback((tab: BuilderTabId) => {
    setDirtyTabs((prev) => (prev.includes(tab) ? prev : [...prev, tab]));
  }, []);

  const buildState = (): EventBuilderState => ({
    eventId: initial?.eventId,
    title,
    slug: initial?.slug ?? "",
    shortDescription: initial?.shortDescription ?? "",
    description: initial?.description ?? "",
    coverImage,
    venueName,
    venueCity: initial?.venueCity ?? "Dhaka",
    startDate,
    endDate: initial?.endDate ?? "",
    globalFormFields,
    segments,
    activeTab,
    dirtyTabs,
  });

  useEffect(() => {
    const id = setInterval(() => {
      void onSaveDraft(buildState());
    }, 30_000);
    return () => clearInterval(id);
  }, [title, segments, globalFormFields, coverImage, venueName, startDate]);

  const renderTab = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="text-sm text-zinc-400">Short description</label>
              <Input
                value={initial?.shortDescription ?? ""}
                className="mt-1 border-white/10 bg-white/5"
                onChange={() => markDirty("basic")}
              />
            </div>
          </div>
        );
      case "media":
        return (
          <EventBuilderMediaTab
            coverImage={coverImage}
            videoThumbnail=""
            onCover={(v: string) => {
              setCoverImage(v);
              markDirty("media");
            }}
            onVideo={() => markDirty("media")}
          />
        );
      case "venue":
        return (
          <div className="max-w-md space-y-3">
            <label className="text-sm text-zinc-400">Venue name</label>
            <Input
              value={venueName}
              onChange={(e) => {
                setVenueName(e.target.value);
                markDirty("venue");
              }}
              className="border-white/10 bg-white/5"
            />
          </div>
        );
      case "segments":
        return (
          <SegmentBuilder
            segments={segments}
            onChange={(s) => {
              setSegments(s);
              markDirty("segments");
            }}
          />
        );
      case "forms":
        return (
          <FormBuilder
            fields={globalFormFields}
            onChange={(f) => {
              setGlobalFormFields(f);
              markDirty("forms");
            }}
          />
        );
      case "preview":
        return (
          <PreviewPanel
            title={title}
            startDate={startDate}
            venueName={venueName}
            coverImage={coverImage}
            segments={segments}
            globalFormFields={globalFormFields}
          />
        );
      default:
        return <p className="text-sm text-zinc-500">Configure {activeTab} in the full builder.</p>;
    }
  };

  return (
    <div className="min-h-[600px] rounded-2xl border border-white/10 bg-[#070B1A]/80">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-6 py-4">
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markDirty("basic");
          }}
          placeholder="Event title"
          className="max-w-md border-0 bg-transparent text-xl font-bold text-white focus-visible:ring-0"
        />
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setActiveTab("preview")}>
            Preview
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={saving}
            onClick={() => void onSaveDraft(buildState())}
          >
            Save draft
          </Button>
          {onPublish && (
            <Button type="button" size="sm" className="bg-accent-magenta" disabled={saving} onClick={() => void onPublish(buildState())}>
              Publish
            </Button>
          )}
        </div>
      </header>

      <div className="flex gap-6 p-6">
        <EventBuilderTabs activeTab={activeTab} onChange={setActiveTab} dirtyTabs={dirtyTabs} />
        <div className="min-w-0 flex-1">{renderTab()}</div>
      </div>
    </div>
  );
}
