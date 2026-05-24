import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  accent = "pink",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "pink" | "purple" | "blue" | "green";
}) {
  const accentClass = {
    pink: "text-[#FF3EA5] bg-[#FF3EA5]/10",
    purple: "text-[#9B5CFF] bg-[#9B5CFF]/10",
    blue: "text-[#4F8CFF] bg-[#4F8CFF]/10",
    green: "text-emerald-400 bg-emerald-400/10",
  }[accent];

  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
        </div>
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accentClass)}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
