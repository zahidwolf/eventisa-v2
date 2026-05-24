"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminEvents, type AdminEventRow } from "@/services/admin/admin-events.service";
import { AdminEventActions } from "@/components/admin/events/AdminEventActions";
import { adminRoutes } from "@/config/admin-routes";
import { ADMIN_LIST_STALE_MS } from "@/lib/admin-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const selectClass =
  "h-9 rounded-md border border-white/10 bg-[#151B31] px-2 text-sm text-white";

export function AdminEventTable({ initialSearch }: { initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch ?? "");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-events", search, status, sort, page],
    queryFn: () =>
      fetchAdminEvents({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        sort,
        page,
        limit: PAGE_SIZE,
      }),
    staleTime: ADMIN_LIST_STALE_MS,
  });

  const events = useMemo(() => (data?.data.events ?? []) as AdminEventRow[], [data]);
  const total = data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search title…"
          className={cn(selectClass, "min-w-[200px] flex-1")}
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="all">All statuses</option>
          <option value="live">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="ended">Ended</option>
        </select>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="revenue">Revenue</option>
          <option value="tickets">Most sold</option>
        </select>
      </div>
      <div className="glass-panel overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-xs text-zinc-500">
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Organizer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Sold</th>
              <th className="px-4 py-3">Revenue</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && events.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No events found
                </td>
              </tr>
            )}
            {events.map((ev) => {
              const org = ev.organizer as { name?: string; email?: string } | undefined;
              return (
                <tr key={ev._id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link
                      href={adminRoutes.eventOverview(ev._id)}
                      className="font-medium text-white hover:text-[#FF3EA5]"
                    >
                      {ev.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {org?.name ?? "—"}
                    {org?.email && (
                      <span className="block text-xs text-zinc-600">{org.email}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {ev.ticketsSold ?? 0} / {ev.capacity ?? 0}
                  </td>
                  <td className="px-4 py-3">৳{(ev.revenue ?? 0).toLocaleString("en-BD")}</td>
                  <td className="px-4 py-3 capitalize text-zinc-400">{ev.status}</td>
                  <td className="px-4 py-3">
                    <AdminEventActions
                      eventId={ev._id}
                      slug={ev.slug}
                      status={ev.status}
                      approvalStatus={ev.approvalStatus}
                      onChanged={() => void refetch()}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
