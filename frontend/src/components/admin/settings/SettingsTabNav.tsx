"use client";

import { cn } from "@/lib/utils";
import type { SettingsTab } from "@/types/platform-settings";

const TABS: { id: SettingsTab; label: string; superOnly?: boolean }[] = [
  { id: "platform", label: "Platform" },
  { id: "admins", label: "Admins", superOnly: true },
  { id: "fees", label: "Fees & Finance" },
  { id: "events", label: "Event Controls" },
  { id: "organizers", label: "Organizer Controls" },
  { id: "security", label: "Security" },
  { id: "system", label: "System" },
];

export function SettingsTabNav({
  active,
  onChange,
  isSuperAdmin,
}: {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
  isSuperAdmin: boolean;
}) {
  const visible = TABS.filter((t) => !t.superOnly || isSuperAdmin);

  return (
    <nav className="flex flex-col gap-1 lg:w-52 lg:shrink-0">
      {visible.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-lg px-3 py-2 text-left text-sm transition-colors",
            active === tab.id
              ? "bg-[#FF3EA5]/15 font-medium text-[#FF3EA5]"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
