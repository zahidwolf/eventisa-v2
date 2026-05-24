"use client";

import type { BuilderTabId } from "@/types/eventBuilder.types";

const TABS: { id: BuilderTabId; label: string }[] = [
  { id: "basic", label: "Basic Info" },
  { id: "media", label: "Media" },
  { id: "venue", label: "Venue" },
  { id: "segments", label: "Ticket Segments" },
  { id: "forms", label: "Custom Forms" },
  { id: "preview", label: "Preview" },
];

interface EventBuilderTabsProps {
  activeTab: BuilderTabId;
  onChange: (tab: BuilderTabId) => void;
  dirtyTabs?: BuilderTabId[];
}

export function EventBuilderTabs({ activeTab, onChange, dirtyTabs = [] }: EventBuilderTabsProps) {
  return (
    <nav className="flex flex-col gap-1 border-r border-white/10 pr-4">
      {TABS.map((t) => {
        const dirty = dirtyTabs.includes(t.id);
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`relative rounded-lg px-3 py-2 text-left text-sm transition ${
              active
                ? "bg-accent-purple/25 font-medium text-white"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            {t.label}
            {dirty && (
              <span className="absolute right-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent-magenta" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
