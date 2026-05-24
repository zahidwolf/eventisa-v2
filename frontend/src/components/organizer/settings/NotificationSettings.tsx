"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { patchNotificationPreferences, type OrganizerSettings } from "@/services/organizer/settings.service";
import { getApiErrorMessage } from "@/services/api/client";

const GROUPS: { title: string; keys: { key: string; label: string }[] }[] = [
  {
    title: "Event notifications",
    keys: [
      { key: "newBooking", label: "New booking received" },
      { key: "bookingCancelled", label: "Booking cancelled" },
      { key: "eventApproved", label: "Event approved by admin" },
      { key: "eventRejected", label: "Event rejected by admin" },
    ],
  },
  {
    title: "Finance notifications",
    keys: [
      { key: "payoutProcessed", label: "Payout processed" },
      { key: "payoutRejected", label: "Payout rejected" },
    ],
  },
  {
    title: "Summary emails",
    keys: [
      { key: "weeklySummary", label: "Weekly event performance summary" },
      { key: "dailyDigest", label: "Daily booking digest" },
    ],
  },
];

export function NotificationSettings({
  settings,
  onSaved,
}: {
  settings: OrganizerSettings;
  onSaved: (s: OrganizerSettings) => void;
}) {
  const [prefs, setPrefs] = useState(settings.notifications);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const data = await patchNotificationPreferences(prefs as Record<string, boolean>);
      onSaved(data);
      toast.success("Preferences saved");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">{g.title}</h3>
          <div className="space-y-3">
            {g.keys.map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={!!prefs[key]}
                  onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                  className="h-4 w-4 rounded border-white/20"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      ))}
      <Button onClick={() => void save()} disabled={loading} className="bg-accent-magenta hover:bg-accent-magenta/90">
        Save preferences
      </Button>
    </div>
  );
}
