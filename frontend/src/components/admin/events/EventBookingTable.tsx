"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  exportAdminBookings,
  fetchAdminEventBookings,
  type AdminBookingRow,
} from "@/services/admin/admin-event-detail.service";
import { BookingDetailDrawer } from "@/components/admin/events/BookingDetailDrawer";
import { cn } from "@/lib/utils";

const selectClass =
  "h-9 rounded-md border border-white/10 bg-[#151B31] px-2 text-sm text-white";

const statusClass: Record<string, string> = {
  paid: "bg-emerald-500/20 text-emerald-300",
  pending: "bg-amber-500/20 text-amber-300",
  failed: "bg-red-500/20 text-red-300",
  refunded: "bg-zinc-500/20 text-zinc-300",
  cancelled: "bg-zinc-500/20 text-zinc-400",
};

interface EventBookingTableProps {
  eventId: string;
  initialSegmentId?: string;
  segments?: { segmentId: string; name: string }[];
}

export function EventBookingTable({
  eventId,
  initialSegmentId,
  segments = [],
}: EventBookingTableProps) {
  const [search, setSearch] = useState("");
  const [segmentId, setSegmentId] = useState(initialSegmentId ?? "");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [drawerOrderId, setDrawerOrderId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      segmentId: segmentId || undefined,
      status: status === "all" ? undefined : status,
      sort,
      page,
      limit: 25,
    }),
    [search, segmentId, status, sort, page]
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-event-bookings", eventId, params],
    queryFn: () => fetchAdminEventBookings(eventId, params),
  });

  const rows = data?.rows ?? [];

  const download = async (format: "csv" | "excel") => {
    const blob = await exportAdminBookings(eventId, format, {
      search: params.search,
      segmentId: params.segmentId,
      status: params.status,
      sort: params.sort,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${eventId}.${format === "excel" ? "xlsx" : "csv"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search buyer, email, order ID…"
          className={cn(selectClass, "min-w-[200px] flex-1")}
        />
        <select
          value={segmentId}
          onChange={(e) => {
            setSegmentId(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="">All segments</option>
          {segments.map((s) => (
            <option key={s.segmentId} value={s.segmentId}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="all">All statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectClass}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="amount">Amount high–low</option>
        </select>
        <Button size="sm" variant="secondary" onClick={() => download("csv")}>
          CSV
        </Button>
        <Button size="sm" variant="secondary" onClick={() => download("excel")}>
          Excel
        </Button>
      </div>

      <div className="glass-panel overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-xs text-zinc-500">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Segment</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Promo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Booked</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading &&
              rows.map((row: AdminBookingRow) => (
                <tr key={row.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-300">{row.orderIdShort}</td>
                  <td className="px-4 py-3">
                    <div className="text-white">{row.buyerName}</div>
                    <div className="text-xs text-zinc-500">{row.buyerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{row.segmentName}</td>
                  <td className="px-4 py-3">{row.quantity}</td>
                  <td className="px-4 py-3">৳{row.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {row.promoCode ? `${row.promoCode} (−৳${row.discount})` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs capitalize",
                        statusClass[row.paymentStatus] ?? statusClass.pending
                      )}
                    >
                      {row.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(row.bookedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" onClick={() => setDrawerOrderId(row.orderId)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>
            {data.total} bookings · page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <BookingDetailDrawer
        eventId={eventId}
        orderId={drawerOrderId}
        onClose={() => setDrawerOrderId(null)}
        onChanged={() => refetch()}
      />
    </div>
  );
}
