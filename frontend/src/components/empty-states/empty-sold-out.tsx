import { Ticket } from "lucide-react";

export function EmptySoldOut({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-700/50 bg-zinc-900/50 text-center ${compact ? "p-4" : "p-8"}`}
    >
      <Ticket className="mx-auto h-10 w-10 text-zinc-600" />
      <p className="mt-4 font-semibold text-zinc-400">Sold out</p>
      <p className="mt-1 text-sm text-zinc-600">Join the waitlist — coming soon</p>
    </div>
  );
}
