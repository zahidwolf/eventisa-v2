"use client";

import { OrderCard } from "@/components/user/orders/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrderFilter, UserOrderRow } from "@/types/user-dashboard";

const TABS: { id: OrderFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "cancelled", label: "Cancelled" },
  { id: "refunded", label: "Refunded" },
];

export function OrderList({
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
  filter: OrderFilter;
  onFilterChange: (f: OrderFilter) => void;
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
          placeholder="Search event or order ID…"
          className="max-w-xs border-white/10 bg-white/5"
        />
      </div>

      {isLoading ? (
        <p className="py-12 text-center text-sm text-zinc-500">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-zinc-500">
          No orders found.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} onView={() => onView(order)} />
          ))}
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-zinc-500">
            Page {page} of {totalPages} · {total} orders
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
