"use client";

import { BD_CITIES, EVENT_CATEGORIES } from "@/lib/events/event-utils";
import type { EventFilters, SortOption } from "@/lib/events/filter-events";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventFiltersPanelProps {
  filters: EventFilters;
  sort: SortOption;
  onChange: (f: EventFilters, s: SortOption) => void;
}

export function EventFiltersPanel({ filters, sort, onChange }: EventFiltersPanelProps) {
  const update = (patch: Partial<EventFilters>) => onChange({ ...filters, ...patch }, sort);
  const updateSort = (s: SortOption) => onChange(filters, s);

  return (
    <aside className="glass-panel sticky top-20 space-y-5 rounded-2xl p-5 lg:top-24">
      <div>
        <Label className="text-zinc-400">Sort</Label>
        <select
          className="mt-1 flex h-11 w-full rounded-lg border border-white/10 bg-surface-elevated px-3 text-sm"
          value={sort}
          onChange={(e) => updateSort(e.target.value as SortOption)}
        >
          <option value="popular">Popular</option>
          <option value="latest">Latest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
      <div>
        <Label className="text-zinc-400">City</Label>
        <select
          className="mt-1 flex h-11 w-full rounded-lg border border-white/10 bg-surface-elevated px-3 text-sm"
          value={filters.city ?? ""}
          onChange={(e) => update({ city: e.target.value || undefined })}
        >
          <option value="">All</option>
          {BD_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-zinc-400">Category</Label>
        <select
          className="mt-1 flex h-11 w-full rounded-lg border border-white/10 bg-surface-elevated px-3 text-sm"
          value={filters.category ?? ""}
          onChange={(e) => update({ category: e.target.value || undefined })}
        >
          <option value="">All</option>
          {EVENT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-zinc-400">Date</Label>
        <Input
          type="date"
          className="mt-1"
          value={filters.date ?? ""}
          onChange={(e) => update({ date: e.target.value || undefined })}
        />
      </div>
      <div className="space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!filters.today}
            onChange={(e) => update({ today: e.target.checked })}
          />
          Today
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!filters.weekend}
            onChange={(e) => update({ weekend: e.target.checked })}
          />
          This weekend
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!filters.trending}
            onChange={(e) => update({ trending: e.target.checked })}
          />
          Trending
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!filters.freeOnly}
            onChange={(e) => update({ freeOnly: e.target.checked })}
          />
          Free events
        </label>
      </div>
    </aside>
  );
}
