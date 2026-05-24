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
import { patchOrganizerControlSettings } from "@/services/admin/admin-settings.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { PlatformSettings } from "@/types/platform-settings";

export function OrganizerControlSettingsPanel({
  settings,
  readOnly,
  onSaved,
}: {
  settings: PlatformSettings;
  readOnly: boolean;
  onSaved: (s: PlatformSettings) => void;
}) {
  const [form, setForm] = useState(settings.organizerControls);
  useEffect(() => setForm(settings.organizerControls), [settings]);

  const save = useMutation({
    mutationFn: () => patchOrganizerControlSettings(form),
    onSuccess: (data) => {
      toast.success("Organizer controls saved");
      onSaved(data);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <ToggleRow
        label="Require admin approval for new organizers"
        checked={form.requireApproval}
        disabled={readOnly}
        onChange={(requireApproval) => setForm({ ...form, requireApproval })}
      />
      <ToggleRow
        label="Auto-approve organizers with verified trade license"
        checked={form.autoApproveVerified}
        disabled={readOnly}
        onChange={(autoApproveVerified) => setForm({ ...form, autoApproveVerified })}
      />
      <FieldRow label="Max active events per organizer" hint="0 = unlimited">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.maxActiveEventsPerOrganizer}
          onChange={(e) => setForm({ ...form, maxActiveEventsPerOrganizer: Number(e.target.value) })}
        />
      </FieldRow>
      <FieldRow label="Max free events per organizer per month" hint="0 = unlimited">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.maxFreeEventsPerMonth}
          onChange={(e) => setForm({ ...form, maxFreeEventsPerMonth: Number(e.target.value) })}
        />
      </FieldRow>
      <ToggleRow
        label="Use global service fee for all organizers"
        description="Per-organizer rates can be set on the organizer detail page when disabled."
        checked={form.useGlobalFee}
        disabled={readOnly}
        onChange={(useGlobalFee) => setForm({ ...form, useGlobalFee })}
      />
      <FieldRow label="New organizer welcome message">
        <textarea
          disabled={readOnly}
          rows={4}
          value={form.welcomeMessage}
          onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        />
      </FieldRow>
      <SaveBar saving={save.isPending} readOnly={readOnly} onSave={() => save.mutate()} />
    </div>
  );
}
