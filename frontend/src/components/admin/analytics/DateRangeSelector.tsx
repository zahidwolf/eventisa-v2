"use client";

import { cn } from "@/lib/utils";
import type { AnalyticsDays } from "@/types/adminAnalytics.types";

const OPTIONS: { label: string; value: AnalyticsDays }[] = [
  { label: "7D", value: 7 },
  { label: "30D", value: 30 },
  { label: "90D", value: 90 },
  { label: "1Y", value: 365 },
];

export function DateRangeSelector({
  value,
  onChange,
}: {
  value: AnalyticsDays;
  onChange: (days: AnalyticsDays) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-semibold transition",
            value === opt.value
              ? "bg-[#FF3EA5] text-white"
              : "text-zinc-400 hover:text-white"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
