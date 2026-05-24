"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FieldRow, SaveBar, TextInput, ToggleRow } from "@/components/admin/settings/settings-form-parts";
import { patchSecuritySettings } from "@/services/admin/admin-settings.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { PlatformSettings } from "@/types/platform-settings";

export function SecuritySettingsPanel({
  settings,
  readOnly,
  onSaved,
}: {
  settings: PlatformSettings;
  readOnly: boolean;
  onSaved: (s: PlatformSettings) => void;
}) {
  const [form, setForm] = useState(settings.security);
  useEffect(() => setForm(settings.security), [settings]);

  const save = useMutation({
    mutationFn: () =>
      patchSecuritySettings({
        ...form,
        allowedOrigins: form.allowedOrigins.length
          ? form.allowedOrigins
          : ["http://localhost:3000"],
      }),
    onSuccess: (data) => {
      toast.success("Security settings saved");
      onSaved(data);
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
        Some changes require restarting the server to take effect.
      </p>
      <FieldRow label="JWT access token expiry">
        <select
          disabled={readOnly}
          value={form.accessTokenExpiry}
          onChange={(e) => setForm({ ...form, accessTokenExpiry: e.target.value })}
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          {["15m", "30m", "1h", "2h"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </FieldRow>
      <FieldRow label="JWT refresh token expiry">
        <select
          disabled={readOnly}
          value={form.refreshTokenExpiry}
          onChange={(e) => setForm({ ...form, refreshTokenExpiry: e.target.value })}
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          {["7d", "14d", "30d"].map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </FieldRow>
      <FieldRow label="Max login attempts before lockout">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.maxLoginAttempts}
          onChange={(e) => setForm({ ...form, maxLoginAttempts: Number(e.target.value) })}
        />
      </FieldRow>
      <FieldRow label="Lockout duration (minutes)">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.lockoutDurationMinutes}
          onChange={(e) => setForm({ ...form, lockoutDurationMinutes: Number(e.target.value) })}
        />
      </FieldRow>
      <FieldRow label="Min password length">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.minPasswordLength}
          onChange={(e) => setForm({ ...form, minPasswordLength: Number(e.target.value) })}
        />
      </FieldRow>
      <ToggleRow
        label="Require uppercase"
        checked={form.requireUppercase}
        disabled={readOnly}
        onChange={(requireUppercase) => setForm({ ...form, requireUppercase })}
      />
      <ToggleRow
        label="Require number"
        checked={form.requireNumber}
        disabled={readOnly}
        onChange={(requireNumber) => setForm({ ...form, requireNumber })}
      />
      <ToggleRow
        label="Require special character"
        checked={form.requireSpecialChar}
        disabled={readOnly}
        onChange={(requireSpecialChar) => setForm({ ...form, requireSpecialChar })}
      />
      <FieldRow label="Rate limit (requests per IP per minute)">
        <TextInput
          type="number"
          disabled={readOnly}
          value={form.rateLimitPerMinute}
          onChange={(e) => setForm({ ...form, rateLimitPerMinute: Number(e.target.value) })}
        />
      </FieldRow>
      <FieldRow label="Allowed CORS origins" hint="One per line">
        <textarea
          disabled={readOnly}
          rows={4}
          value={form.allowedOrigins.join("\n")}
          onChange={(e) =>
            setForm({
              ...form,
              allowedOrigins: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
            })
          }
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        />
      </FieldRow>
      <SaveBar saving={save.isPending} readOnly={readOnly} onSave={() => save.mutate()} />
    </div>
  );
}
