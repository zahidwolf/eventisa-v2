import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  live: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  draft: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ended: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  approved: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  live: "Published",
  draft: "Draft",
  pending: "Pending",
  ended: "Ended",
  rejected: "Rejected",
  approved: "Approved",
};

export function EventStatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        STATUS_STYLES[key] ?? STATUS_STYLES.draft
      )}
    >
      {STATUS_LABELS[key] ?? status}
    </span>
  );
}
