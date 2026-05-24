"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { TrackingSettingsSection } from "@/components/admin/settings/TrackingSettingsSection";
import {
  FieldRow,
  SaveBar,
  TextInput,
  ToggleRow,
} from "@/components/admin/settings/settings-form-parts";
import { patchPlatformSettings } from "@/services/admin/admin-settings.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { PlatformSettings } from "@/types/platform-settings";

function normalizePlatform(platform: PlatformSettings["platform"]) {
  return {
    ...platform,
    socialLinks: {
      facebook: platform.socialLinks?.facebook ?? "",
      instagram: platform.socialLinks?.instagram ?? "",
      twitter: platform.socialLinks?.twitter ?? "",
    },
  };
}

export function PlatformSettingsPanel({
  settings,
  readOnly,
  onSaved,
}: {
  settings: PlatformSettings;
  readOnly: boolean;
  onSaved: (s: PlatformSettings) => void;
}) {
  const [form, setForm] = useState(() => normalizePlatform(settings.platform));
  const [confirm, setConfirm] = useState("");

  useEffect(() => setForm(normalizePlatform(settings.platform)), [settings]);

  const save = useMutation({
    mutationFn: () =>
      patchPlatformSettings({
        ...form,
        ...(form.maintenanceMode ? { maintenanceConfirm: confirm } : {}),
      }),
    onSuccess: (data) => {
      toast.success("Platform settings saved");
      onSaved(data);
      setConfirm("");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <FieldRow label="Platform name *">
        <TextInput
          value={form.name}
          disabled={readOnly}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </FieldRow>
      <FieldRow label="Tagline">
        <TextInput
          value={form.tagline}
          disabled={readOnly}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
        />
      </FieldRow>
      <FieldRow label="Support email">
        <TextInput
          type="email"
          value={form.supportEmail}
          disabled={readOnly}
          onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
        />
      </FieldRow>
      <FieldRow label="Support phone">
        <TextInput
          value={form.supportPhone ?? ""}
          disabled={readOnly}
          onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
        />
      </FieldRow>
      <FieldRow label="Website URL">
        <TextInput
          value={form.websiteUrl}
          disabled={readOnly}
          onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
        />
      </FieldRow>
      <div className="grid gap-4 sm:grid-cols-3">
        {(["facebook", "instagram", "twitter"] as const).map((key) => (
          <FieldRow key={key} label={`${key.charAt(0).toUpperCase()}${key.slice(1)} URL`}>
            <TextInput
              value={form.socialLinks[key] ?? ""}
              disabled={readOnly}
              onChange={(e) =>
                setForm({
                  ...form,
                  socialLinks: { ...form.socialLinks, [key]: e.target.value },
                })
              }
            />
          </FieldRow>
        ))}
      </div>

      <ToggleRow
        label="Maintenance mode"
        description="When ON, buyers and organizers are blocked. Admins retain full access."
        checked={form.maintenanceMode}
        disabled={readOnly}
        onChange={(maintenanceMode) => setForm({ ...form, maintenanceMode })}
      />
      {form.maintenanceMode && !readOnly && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          <p className="font-medium">This will block all buyers and organizers from accessing Eventisa.</p>
          <p className="mt-2 text-xs text-amber-200/80">Type CONFIRM below to enable maintenance mode.</p>
          <TextInput
            className="mt-3"
            placeholder="CONFIRM"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      )}

      <SaveBar saving={save.isPending} readOnly={readOnly} onSave={() => save.mutate()} />

      <TrackingSettingsSection settings={settings} readOnly={readOnly} onSaved={onSaved} />
    </div>
  );
}
