"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchOrganizerSettings, type OrganizerSettings as Settings } from "@/services/organizer/settings.service";
import { ORGANIZER_SETTINGS_STALE_MS } from "@/lib/organizer-query";
import { ProfileSettings } from "@/components/organizer/settings/ProfileSettings";
import { OrganizationSettings } from "@/components/organizer/settings/OrganizationSettings";
import { SecuritySettings } from "@/components/organizer/settings/SecuritySettings";
import { NotificationSettings } from "@/components/organizer/settings/NotificationSettings";
import { BankingSettings } from "@/components/organizer/settings/BankingSettings";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "organization", label: "Organization" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "banking", label: "Payout & Banking" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function OrganizerSettings() {
  const [tab, setTab] = useState<TabId>("profile");
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["organizer-settings"],
    queryFn: fetchOrganizerSettings,
    staleTime: ORGANIZER_SETTINGS_STALE_MS,
  });
  const [settings, setSettings] = useState<Settings | null>(null);

  const active = settings ?? data ?? null;

  const onSaved = (s: Settings) => {
    setSettings(s);
    void refetch();
  };

  if (isLoading || !active) {
    return (
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">Manage your profile, organization, and preferences</p>

      <div className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition lg:w-full",
                tab === t.id
                  ? "bg-accent-magenta/20 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="glass-panel min-w-0 rounded-2xl p-6">
          {tab === "profile" && <ProfileSettings settings={active} onSaved={onSaved} />}
          {tab === "organization" && <OrganizationSettings settings={active} onSaved={onSaved} />}
          {tab === "security" && <SecuritySettings />}
          {tab === "notifications" && <NotificationSettings settings={active} onSaved={onSaved} />}
          {tab === "banking" && <BankingSettings settings={active} onSaved={onSaved} />}
        </div>
      </div>
    </div>
  );
}
