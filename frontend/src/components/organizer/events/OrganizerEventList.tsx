"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { OrganizerEventCard } from "@/components/organizer/events/OrganizerEventCard";
import { fetchOrganizerEvents } from "@/services/organizer/organizer-events.service";
import type {
  OrganizerEventFilterStatus,
  OrganizerEventSort,
} from "@/types/organizer-event-management";

const PAGE_SIZE = 20;

const selectClass = cn(
  "h-10 w-full rounded-md border border-white/10 bg-surface-card px-3 text-sm text-white sm:w-auto",
  "focus:border-[#FF3EA5]/50 focus:outline-none focus:ring-1 focus:ring-[#FF3EA5]/30"
);

export function OrganizerEventList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrganizerEventFilterStatus>("all");
  const [sort, setSort] = useState<OrganizerEventSort>("newest");
  const [page, setPage] = useState(1);

  const queryKey = useMemo(
    () => ["organizer-events", search, status, sort, page],
    [search, status, sort, page]
  );

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      fetchOrganizerEvents({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        sort,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const events = data?.data.events ?? [];
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search by title…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as OrganizerEventFilterStatus);
            setPage(1);
          }}
          className={selectClass}
          aria-label="Filter by status"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="ended">Ended</option>
        </select>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as OrganizerEventSort);
            setPage(1);
          }}
          className={selectClass}
          aria-label="Sort events"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="most_sold">Most sold</option>
          <option value="revenue">Revenue</option>
        </select>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <p className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-zinc-500">
          No events match your filters.
        </p>
      )}

      <div className="space-y-4">
        {events.map((ev) => (
          <OrganizerEventCard key={ev._id} event={ev} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            Page {page} of {totalPages} · {total} events
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
