"use client";

import { Check, AlertTriangle } from "lucide-react";
import { resolveUploadUrl } from "@/lib/media/resolve-upload-url";
import { Button } from "@/components/ui/button";
import {
  publishWarnings,
  validateForPublish,
} from "@/components/organizer/event-builder/wizard-mappers";
import type { EventWizardState } from "@/components/organizer/event-builder/wizard.types";

interface EventReviewProps {
  state: EventWizardState;
  isAdmin?: boolean;
  isEdit?: boolean;
  saving?: boolean;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
  onPublishImmediately?: () => void;
  onSaveChanges?: () => void;
}

export function EventReview({
  state,
  isAdmin,
  isEdit,
  saving,
  onSaveDraft,
  onSubmitForReview,
  onPublishImmediately,
  onSaveChanges,
}: EventReviewProps) {
  const errors = validateForPublish(state, isAdmin);
  const warnings = publishWarnings(state);

  const checklist = [
    { ok: !!state.title.trim(), label: "Event title added" },
    { ok: !!state.coverImage, label: "Banner image uploaded" },
    { ok: state.segments.length > 0, label: "At least 1 segment created" },
    { ok: !!state.startDate && !!state.endDate, label: "Event schedule set" },
    {
      ok: !!state.registrationStart && !!state.registrationEnd,
      label: "Registration window set",
    },
    {
      warn: state.eventFormat !== "online" && !state.venueName.trim(),
      label: "No venue added",
    },
    { warn: !state.description.trim(), label: "No description" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Event summary
        </h3>
        <div className="flex gap-4">
          {state.coverImage ? (
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveUploadUrl(state.coverImage)}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-20 w-32 shrink-0 rounded-lg bg-white/10" />
          )}
          <div className="min-w-0">
            <p className="text-lg font-bold text-white">{state.title || "Untitled"}</p>
            <p className="text-sm text-zinc-400">{state.category}</p>
            <p className="mt-1 text-xs text-zinc-500">
              Event:{" "}
              {state.startDate ? new Date(state.startDate).toLocaleString() : "—"}
              {state.endDate ? ` – ${new Date(state.endDate).toLocaleString()}` : ""}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Registration:{" "}
              {state.registrationStart
                ? new Date(state.registrationStart).toLocaleString()
                : "—"}
              {state.registrationEnd
                ? ` – ${new Date(state.registrationEnd).toLocaleString()}`
                : ""}
            </p>
            {state.venueName && (
              <p className="mt-1 text-xs text-zinc-500">{state.venueName}</p>
            )}
            {state.shortDescription && (
              <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{state.shortDescription}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 overflow-hidden">
        <h3 className="border-b border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Segments
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-zinc-500">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Capacity</th>
                <th className="px-4 py-2">Form fields</th>
              </tr>
            </thead>
            <tbody>
              {state.segments.map((s) => (
                <tr key={s.segmentId} className="border-b border-white/5">
                  <td className="px-4 py-2 font-medium text-white">{s.name}</td>
                  <td className="px-4 py-2">{s.isFree ? "Free" : "Paid"}</td>
                  <td className="px-4 py-2">{s.isFree ? "—" : `৳${s.price}`}</td>
                  <td className="px-4 py-2">{s.capacity}</td>
                  <td className="px-4 py-2">{s.formFields.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {state.segments.length === 0 && (
          <p className="px-5 py-4 text-sm text-zinc-500">No segments configured.</p>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Checklist</h3>
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              {"ok" in item && item.ok && (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-zinc-300">{item.label}</span>
                </>
              )}
              {"ok" in item && !item.ok && (
                <>
                  <span className="h-4 w-4 rounded-full border border-zinc-600" />
                  <span className="text-zinc-500">{item.label}</span>
                </>
              )}
              {"warn" in item && item.warn && (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-200/90">{item.label}</span>
                </>
              )}
            </li>
          ))}
        </ul>
        {errors.length > 0 && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        )}
        {warnings.length > 0 && errors.length === 0 && (
          <p className="text-xs text-amber-400/80">Warnings above will not block publishing.</p>
        )}
      </section>

      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
        {isEdit ? (
          <Button type="button" disabled={saving} onClick={onSaveChanges}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        ) : (
          <>
            <Button type="button" variant="outline" disabled={saving} onClick={onSaveDraft}>
              Save as draft
            </Button>
            {isAdmin ? (
              <Button
                type="button"
                className="bg-accent-magenta"
                disabled={saving || errors.length > 0}
                onClick={onPublishImmediately}
              >
                Publish immediately
              </Button>
            ) : (
              <Button
                type="button"
                className="bg-accent-magenta"
                disabled={saving || errors.length > 0}
                onClick={() => void onSubmitForReview()}
              >
                {saving ? "Submitting…" : "Submit for review"}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
