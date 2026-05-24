"use client";

import { useMemo, useState } from "react";
import { FieldPreview } from "@/components/organizer/event-builder/FieldPreview";
import { getVisibleFields, resolveVisibleFields } from "@/lib/forms/resolve-visible-fields";
import type { FormAnswers } from "@/lib/forms/resolve-visible-fields";
import type { FormField, TicketSegment } from "@/types/eventBuilder.types";

interface PreviewPanelProps {
  title: string;
  startDate?: string;
  venueName?: string;
  coverImage?: string;
  segments: TicketSegment[];
  globalFormFields: FormField[];
}

export function PreviewPanel({
  title,
  startDate,
  venueName,
  coverImage,
  segments,
  globalFormFields,
}: PreviewPanelProps) {
  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    segments[0]?.segmentId ?? null
  );
  const [answers, setAnswers] = useState<FormAnswers>({});

  const segment = segments.find((s) => s.segmentId === selectedSegmentId);
  const rawFields =
    segment && segment.formFields.length > 0 ? segment.formFields : globalFormFields;
  const resolved = useMemo(() => resolveVisibleFields(rawFields, answers), [rawFields, answers]);
  const visible = getVisibleFields(rawFields, answers);

  const setAnswer = (fieldId: string, value: string | string[] | boolean | number) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const frameClass =
    view === "mobile" ? "mx-auto max-w-[390px]" : "w-full max-w-3xl mx-auto";

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(["desktop", "mobile"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`rounded-lg px-4 py-2 text-sm capitalize ${
              view === v ? "bg-accent-purple/30 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className={`${frameClass} rounded-2xl border border-white/10 bg-[#070B1A] overflow-hidden shadow-2xl`}>
        {coverImage && (
          <div className="aspect-[21/9] bg-cover bg-center" style={{ backgroundImage: `url(${coverImage})` }} />
        )}
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-white">{title || "Event title"}</h2>
          <p className="text-sm text-zinc-400">
            {[startDate, venueName].filter(Boolean).join(" · ") || "Date & venue"}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {segments.map((seg) => (
              <button
                key={seg.segmentId}
                type="button"
                onClick={() => setSelectedSegmentId(seg.segmentId)}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedSegmentId === seg.segmentId
                    ? "border-accent-magenta/50 bg-accent-magenta/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.ticketColor ?? "#9B5CFF" }} />
                  <span className="font-semibold text-white">{seg.name}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-400">
                  {seg.isFree ? "FREE" : `৳${seg.price}`} · {seg.remainingQuantity} left
                </p>
                <span className="mt-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-400">
                  {seg.status}
                </span>
              </button>
            ))}
          </div>

          {visible.length > 0 && (
            <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Registration form</p>
              {resolved.map((f) => (
                <FieldPreview
                  key={f.fieldId}
                  field={f}
                  value={answers[f.fieldId]}
                  dimmed={f.hidden}
                  onChange={setAnswer}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
