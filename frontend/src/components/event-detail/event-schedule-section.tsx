import { Calendar, Clock } from "lucide-react";
import { env } from "@/config/env";
import type { EventDetail } from "@/types/models/event";

export function EventScheduleSection({ event }: { event: EventDetail }) {
  const fmt = (d: string) =>
    new Intl.DateTimeFormat(env.locale, {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: env.timezone,
    }).format(new Date(d));

  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl font-bold">Schedule</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-panel flex gap-4 rounded-xl p-5">
          <Calendar className="h-5 w-5 shrink-0 text-primary-neon" />
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Starts</p>
            <p className="mt-1 font-medium">{fmt(event.startDate)}</p>
          </div>
        </div>
        <div className="glass-panel flex gap-4 rounded-xl p-5">
          <Clock className="h-5 w-5 shrink-0 text-accent-magenta" />
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500">Ends</p>
            <p className="mt-1 font-medium">{fmt(event.endDate)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
