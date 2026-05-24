"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPendingEvents } from "@/services/admin/admin-events.service";
import { EventApprovalCard } from "@/components/admin/events/EventApprovalCard";

import { ADMIN_PENDING_QUEUE_STALE_MS } from "@/lib/admin-query";

export default function AdminPendingEventsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-events-pending"],
    queryFn: () => fetchPendingEvents(),
    staleTime: ADMIN_PENDING_QUEUE_STALE_MS,
    refetchOnWindowFocus: true,
  });

  const events = data?.data.events ?? [];

  return (
    <div>
      <p className="mb-6 text-sm text-zinc-500">Review and approve events before they go live.</p>
      {isLoading && <p className="text-zinc-500">Loading…</p>}
      {!isLoading && events.length === 0 && (
        <p className="text-zinc-500">No events awaiting review.</p>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {events.map((ev) => (
          <EventApprovalCard
            key={ev._id}
            event={ev as Parameters<typeof EventApprovalCard>[0]["event"]}
            onChanged={() => qc.invalidateQueries({ queryKey: ["admin-events-pending"] })}
          />
        ))}
      </div>
    </div>
  );
}
