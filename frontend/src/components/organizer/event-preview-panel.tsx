"use client";

import { Monitor, Smartphone } from "lucide-react";
import type { TicketSegment } from "@/lib/forms/form-field-types";
import { isSegmentFree } from "@/lib/forms/form-field-types";

interface EventPreviewPanelProps {
  title: string;
  shortDescription: string;
  coverImage?: string;
  segments: TicketSegment[];
  venueName?: string;
  view?: "desktop" | "mobile";
  onViewChange?: (view: "desktop" | "mobile") => void;
}

export function EventPreviewPanel({
  title,
  shortDescription,
  coverImage,
  segments,
  venueName,
  view = "desktop",
  onViewChange,
}: EventPreviewPanelProps) {
  const visible = segments.filter((s) => s.isVisible && s.status !== "hidden" && s.status !== "draft");
  const frame = view === "mobile" ? "mx-auto max-w-[320px]" : "w-full";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-300">Live preview</p>
        <div className="flex gap-1 rounded-lg border border-white/10 p-1">
          <button
            type="button"
            className={`rounded px-2 py-1 ${view === "desktop" ? "bg-accent-magenta/20 text-accent-magenta" : ""}`}
            onClick={() => onViewChange?.("desktop")}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`rounded px-2 py-1 ${view === "mobile" ? "bg-accent-magenta/20 text-accent-magenta" : ""}`}
            onClick={() => onViewChange?.("mobile")}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className={`${frame} overflow-hidden rounded-2xl border border-white/10 bg-[#070B1A] shadow-2xl`}>
        {coverImage ? (
          <div className="aspect-[16/7] bg-cover bg-center" style={{ backgroundImage: `url(${coverImage})` }} />
        ) : (
          <div className="aspect-[16/7] bg-gradient-to-br from-accent-magenta/30 to-accent-purple/20" />
        )}
        <div className="p-4 space-y-3">
          <h3 className="font-display text-lg font-bold">{title || "Event title"}</h3>
          <p className="text-xs text-zinc-400 line-clamp-2">{shortDescription || "Short description"}</p>
          {venueName && <p className="text-xs text-zinc-500">{venueName}</p>}
          <div className="space-y-2 pt-2">
            {visible.map((s, i) => (
              <div key={i} className="rounded-lg border border-white/10 p-3">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">{s.title}</span>
                  <span className="text-sm text-accent-magenta">
                    {isSegmentFree(s) ? "Free" : `৳${s.price}`}
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-2 w-full rounded-lg bg-accent-magenta py-2 text-xs font-semibold text-white"
                >
                  {isSegmentFree(s) ? "Get Free Ticket" : `Get ${s.title}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
