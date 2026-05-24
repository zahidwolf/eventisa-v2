"use client";

import { RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AttendeeFilters as Filters, SegmentAttendeeCount } from "@/types/attendee.types";

interface AttendeeFiltersProps {
  filters: Filters;
  segments: SegmentAttendeeCount[];
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

export function AttendeeFiltersBar({
  filters,
  segments,
  onChange,
  onReset,
}: AttendeeFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-[#0c1020]/80 p-4">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          className="border-white/10 bg-white/5 pl-10"
          placeholder="Search name, email, order, answers…"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value, page: 1 })}
        />
      </div>
      <div className="min-w-[160px]">
        <label className="mb-1 block text-xs text-zinc-500">Segment</label>
        <select
          className="w-full rounded-lg border border-white/10 bg-[#12121e] px-3 py-2 text-sm text-white"
          value={filters.segmentId ?? ""}
          onChange={(e) => onChange({ segmentId: e.target.value || undefined, page: 1 })}
        >
          <option value="">All segments</option>
          {segments.map((s) => (
            <option key={s.segmentId} value={s.segmentId}>
              {s.name} ({s.count})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">From</label>
        <Input
          type="date"
          className="border-white/10 bg-white/5"
          value={filters.dateFrom?.slice(0, 10) ?? ""}
          onChange={(e) => onChange({ dateFrom: e.target.value || undefined, page: 1 })}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-500">To</label>
        <Input
          type="date"
          className="border-white/10 bg-white/5"
          value={filters.dateTo?.slice(0, 10) ?? ""}
          onChange={(e) => onChange({ dateTo: e.target.value || undefined, page: 1 })}
        />
      </div>
      <Button type="button" variant="outline" className="border-white/15" onClick={onReset}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset
      </Button>
    </div>
  );
}
