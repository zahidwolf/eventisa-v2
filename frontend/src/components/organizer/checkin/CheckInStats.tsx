"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCheckInStats, type CheckInApiScope } from "@/services/checkIn.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { CheckInStats as CheckInStatsType } from "@/types/checkIn.types";

interface CheckInStatsProps {
  eventId: string;
  apiScope?: CheckInApiScope;
}

export function CheckInStatsPanel({ eventId, apiScope = "organizer" }: CheckInStatsProps) {
  const [stats, setStats] = useState<CheckInStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await getCheckInStats(eventId, apiScope));
    } catch (err) {
      console.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [eventId, apiScope]);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 30_000);
    return () => clearInterval(id);
  }, [load]);

  if (loading && !stats) {
    return <p className="text-center text-zinc-500 py-10">Loading stats…</p>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="min-h-12 border-white/15 gap-2"
          onClick={() => void load()}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Checked in", stats.totalCheckedIn],
          ["Capacity", stats.totalCapacity],
          ["Rate", `${stats.percentage}%`],
        ].map(([label, val]) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-gradient-to-br from-[#12121e] to-[#070B1A] p-5 text-center"
          >
            <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-white">{val}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {stats.perSegment.map((seg) => {
          const pct = seg.capacity ? Math.min(100, Math.round((seg.checkedIn / seg.capacity) * 100)) : 0;
          return (
            <div key={seg.segmentId} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-medium text-white">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: seg.color ?? "#9B5CFF" }}
                  />
                  {seg.name}
                </span>
                <span className="text-sm text-zinc-400">
                  {seg.checkedIn}/{seg.capacity}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-magenta transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500">{seg.remaining} remaining</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
