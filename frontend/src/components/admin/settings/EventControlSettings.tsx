"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FieldRow,
  SaveBar,
  TextInput,
  ToggleRow,
} from "@/components/admin/settings/settings-form-parts";
import { EVENT_CATEGORY_TAXONOMY } from "@/lib/categories/event-categories";
import { patchEventControlSettings } from "@/services/admin/admin-settings.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { PlatformSettings } from "@/types/platform-settings";

export function EventControlSettingsPanel({
  settings,
  readOnly,
  onSaved,
}: {
  settings: PlatformSettings;
  readOnly: boolean;
  onSaved: (s: PlatformSettings) => void;
}) {
  const [form, setForm] = useState(settings.eventControls);
  useEffect(() => setForm(settings.eventControls), [settings]);

  const save = useMutation({
    mutationFn: () => patchEventControlSettings(form),
    onSuccess: (data) => {
      toast.success("Event controls saved");
      onSaved(data);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const toggleCategory = (cat: string) => {
    const enabled = form.enabledCategories.includes(cat);
    setForm({
      ...form,
      enabledCategories: enabled
        ? form.enabledCategories.filter((c) => c !== cat)
        : [...form.enabledCategories, cat],
    });
  };

  return (
    <div className="space-y-6">
      <ToggleRow
        label="Require admin approval for new events"
        checked={form.requireApproval}
        disabled={readOnly}
        onChange={(requireApproval) => setForm({ ...form, requireApproval })}
      />
      <FieldRow label="Max segments per event">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.maxSegmentsPerEvent}
          onChange={(e) => setForm({ ...form, maxSegmentsPerEvent: Number(e.target.value) })}
        />
      </FieldRow>
      <FieldRow label="Max tickets per user per event">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.maxTicketsPerUserPerEvent}
          onChange={(e) => setForm({ ...form, maxTicketsPerUserPerEvent: Number(e.target.value) })}
        />
      </FieldRow>
      <ToggleRow
        label="Auto-expire events after end date"
        checked={form.autoExpireEvents}
        disabled={readOnly}
        onChange={(autoExpireEvents) => setForm({ ...form, autoExpireEvents })}
      />
      <FieldRow label="Min event notice period (hours)">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.minNoticePeriodHours}
          onChange={(e) => setForm({ ...form, minNoticePeriodHours: Number(e.target.value) })}
        />
      </FieldRow>
      <FieldRow label="Max event duration (days)">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.maxEventDurationDays}
          onChange={(e) => setForm({ ...form, maxEventDurationDays: Number(e.target.value) })}
        />
      </FieldRow>
      <div>
        <p className="mb-3 text-sm font-medium text-white">Allowed event categories</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {EVENT_CATEGORY_TAXONOMY.map(({ category }) => (
            <label
              key={category}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300"
            >
              <input
                type="checkbox"
                disabled={readOnly}
                checked={form.enabledCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="accent-[#FF3EA5]"
              />
              {category}
            </label>
          ))}
        </div>
      </div>
      <SaveBar saving={save.isPending} readOnly={readOnly} onSave={() => save.mutate()} />
    </div>
  );
}
