"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  FieldRow,
  SaveBar,
  TextInput,
} from "@/components/admin/settings/settings-form-parts";
import { CampaignUrlBuilder } from "@/components/admin/settings/CampaignUrlBuilder";
import { patchTrackingSettings } from "@/services/admin/admin-settings.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { PlatformSettings } from "@/types/platform-settings";

function StatusBadge({ configured }: { configured: boolean }) {
  return (
    <span className={configured ? "text-emerald-400" : "text-amber-400"}>
      {configured ? "✅ Configured" : "⚠️ Not set"}
    </span>
  );
}

export function TrackingSettingsSection({
  settings,
  readOnly,
  onSaved,
}: {
  settings: PlatformSettings;
  readOnly: boolean;
  onSaved: (s: PlatformSettings) => void;
}) {
  const tracking = settings.tracking ?? {
    metaPixelId: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
  };

  const [form, setForm] = useState(tracking);
  const [showPixel, setShowPixel] = useState(false);

  useEffect(() => {
    setForm(
      settings.tracking ?? {
        metaPixelId: "",
        googleAnalyticsId: "",
        googleTagManagerId: "",
      }
    );
  }, [settings]);

  const save = useMutation({
    mutationFn: () => patchTrackingSettings(form),
    onSuccess: (data) => {
      toast.success("Tracking settings saved");
      onSaved(data);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="mt-10 border-t border-white/10 pt-8">
      <h3 className="text-lg font-semibold text-white">Tracking &amp; Analytics</h3>
      <p className="mt-1 text-sm text-zinc-500">
        One platform-wide pixel for all buyer pages. Organizers cannot add their own tracking IDs.
      </p>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <p>
          Meta Pixel: <StatusBadge configured={!!form.metaPixelId.trim()} />
        </p>
        <p>
          GA4: <StatusBadge configured={!!form.googleAnalyticsId.trim()} />
        </p>
        <p>
          GTM: <StatusBadge configured={!!form.googleTagManagerId.trim()} />
        </p>
      </div>

      <div className="mt-6 space-y-6">
        <FieldRow label="Meta Pixel ID">
          <div className="relative">
            <TextInput
              type={showPixel ? "text" : "password"}
              placeholder="e.g. 1234567890123456"
              value={form.metaPixelId}
              disabled={readOnly}
              onChange={(e) => setForm({ ...form, metaPixelId: e.target.value })}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              onClick={() => setShowPixel((v) => !v)}
              aria-label={showPixel ? "Hide pixel ID" : "Show pixel ID"}
            >
              {showPixel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Get from: Facebook Business → Events Manager → Data Sources → Your Pixel → Pixel ID
          </p>
        </FieldRow>

        <FieldRow label="Google Analytics 4">
          <TextInput
            placeholder="G-XXXXXXXXXX"
            value={form.googleAnalyticsId}
            disabled={readOnly}
            onChange={(e) => setForm({ ...form, googleAnalyticsId: e.target.value })}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Get from: GA4 → Admin → Data Streams → Measurement ID
          </p>
        </FieldRow>

        <FieldRow label="Google Tag Manager">
          <TextInput
            placeholder="GTM-XXXXXXX"
            value={form.googleTagManagerId}
            disabled={readOnly}
            onChange={(e) => setForm({ ...form, googleTagManagerId: e.target.value })}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Get from: tagmanager.google.com → Your container ID
          </p>
        </FieldRow>
      </div>

      <SaveBar
        saving={save.isPending}
        readOnly={readOnly}
        label="Save tracking settings"
        onSave={() => save.mutate()}
      />

      {!readOnly && <CampaignUrlBuilder />}
    </div>
  );
}
