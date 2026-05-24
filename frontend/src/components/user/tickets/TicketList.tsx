"use client";

import { TicketCard } from "@/components/user/tickets/TicketCard";
import { Input } from "@/components/ui/input";
import type { TicketFilter, UserOrderRow } from "@/types/user-dashboard";

const TABS: { id: TicketFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

export function TicketList({
  orders,
  total,
  page,
  limit,
  isLoading,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onPageChange,
  onView,
}: {
  orders: UserOrderRow[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  filter: TicketFilter;
  onFilterChange: (f: TicketFilter) => void;
  search: string;
  onSearchChange: (s: string) => void;
  onPageChange: (p: number) => void;
  onView: (order: UserOrderRow) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                filter === tab.id
                  ? "bg-[#FF3EA5] text-white"
                  : "bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by event name…"
          className="max-w-xs border-white/10 bg-white/5"
        />
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-zinc-500">Loading tickets…</p>
      ) : orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-zinc-500">
          No tickets found.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <TicketCard key={order._id} order={order} onView={() => onView(order)} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-white/10 px-3 py-1 text-sm text-zinc-400 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-white/10 px-3 py-1 text-sm text-zinc-400 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
