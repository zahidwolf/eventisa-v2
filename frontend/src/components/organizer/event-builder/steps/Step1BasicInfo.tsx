"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EVENT_CATEGORY_TAXONOMY } from "@/lib/categories/event-categories";
import type { EventWizardState, EventFormat } from "@/components/organizer/event-builder/wizard.types";

interface Step1BasicInfoProps {
  state: EventWizardState;
  errors: Record<string, string>;
  onChange: (patch: Partial<EventWizardState>) => void;
}

const FORMATS: { value: EventFormat; label: string }[] = [
  { value: "in-person", label: "In-person" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
];

export function Step1BasicInfo({ state, errors, onChange }: Step1BasicInfoProps) {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Event title *</Label>
        <Input
          id="title"
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Dhaka Music Fest 2026"
          className="border-white/10 bg-white/5"
        />
        {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <select
          id="category"
          className="flex h-11 w-full rounded-lg border border-white/10 bg-[#070B1A] px-3 text-sm"
          value={state.category}
          onChange={(e) => onChange({ category: e.target.value })}
        >
          {EVENT_CATEGORY_TAXONOMY.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDescription">
          Short description <span className="text-zinc-500">(max 200)</span>
        </Label>
        <textarea
          id="shortDescription"
          maxLength={200}
          rows={3}
          value={state.shortDescription}
          onChange={(e) => onChange({ shortDescription: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-[#070B1A] px-4 py-2 text-sm"
          placeholder="One-line summary for cards and search"
        />
        <p className="text-right text-xs text-zinc-600">{state.shortDescription.length}/200</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Full description <span className="text-zinc-500">(min 10 characters to publish)</span>
        </Label>
        <textarea
          id="description"
          rows={6}
          value={state.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-[#070B1A] px-4 py-2 text-sm"
          placeholder="Tell attendees what to expect…"
        />
        {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
        {state.description.trim().length > 0 && state.description.trim().length < 10 && (
          <p className="text-xs text-amber-400">
            {state.description.trim().length}/10 characters — add more before publishing
          </p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-zinc-300">Event type</legend>
        <div className="flex flex-wrap gap-4">
          {FORMATS.map((f) => (
            <label key={f.value} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="radio"
                name="eventFormat"
                checked={state.eventFormat === f.value}
                onChange={() => onChange({ eventFormat: f.value })}
                className="accent-[#FF3EA5]"
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Event schedule
        </h3>
        <p className="text-xs text-zinc-500">When the event takes place (not registration).</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Event starts *</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={state.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="border-white/10 bg-white/5"
            />
            {errors.startDate && <p className="text-xs text-red-400">{errors.startDate}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Event ends *</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={state.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="border-white/10 bg-white/5"
            />
            {errors.endDate && <p className="text-xs text-red-400">{errors.endDate}</p>}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-accent-magenta/20 bg-accent-magenta/5 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-magenta">
          Registration window
        </h3>
        <p className="text-xs text-zinc-500">
          When attendees can register or buy tickets. Applied to all ticket segments unless a segment
          has its own dates in step 3.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="registrationStart">Registration opens *</Label>
            <Input
              id="registrationStart"
              type="datetime-local"
              value={state.registrationStart}
              onChange={(e) => onChange({ registrationStart: e.target.value })}
              className="border-white/10 bg-white/5"
            />
            {errors.registrationStart && (
              <p className="text-xs text-red-400">{errors.registrationStart}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationEnd">Registration closes *</Label>
            <Input
              id="registrationEnd"
              type="datetime-local"
              value={state.registrationEnd}
              onChange={(e) => onChange({ registrationEnd: e.target.value })}
              className="border-white/10 bg-white/5"
            />
            {errors.registrationEnd && (
              <p className="text-xs text-red-400">{errors.registrationEnd}</p>
            )}
          </div>
        </div>
      </section>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags <span className="text-zinc-500">(optional, comma separated)</span></Label>
        <Input
          id="tags"
          value={state.tags}
          onChange={(e) => onChange({ tags: e.target.value })}
          placeholder="music, outdoor, family"
          className="border-white/10 bg-white/5"
        />
      </div>
    </div>
  );
}
