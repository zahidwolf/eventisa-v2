import { ArrowDown, ArrowUp } from "lucide-react";
import { formatGrowth } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

export function GrowthBadge({ percent }: { percent: number }) {
  const positive = percent > 0;
  const negative = percent < 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
        positive && "bg-emerald-500/15 text-emerald-400",
        negative && "bg-red-500/15 text-red-400",
        !positive && !negative && "bg-zinc-500/15 text-zinc-400"
      )}
    >
      {positive && <ArrowUp className="h-3 w-3" />}
      {negative && <ArrowDown className="h-3 w-3" />}
      {formatGrowth(percent)}
    </span>
  );
}
