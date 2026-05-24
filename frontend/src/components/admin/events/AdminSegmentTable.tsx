"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminRoutes } from "@/config/admin-routes";
import {
  adminUpdateSegment,
  fetchAdminEventOverview,
} from "@/services/admin/admin-event-detail.service";
import { getApiErrorMessage } from "@/services/api/client";
import { cn } from "@/lib/utils";

const selectClass =
  "h-9 rounded-md border border-white/10 bg-[#151B31] px-2 text-sm text-white";

export function AdminSegmentTable({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-event-overview", eventId],
    queryFn: () => fetchAdminEventOverview(eventId),
  });

  const updateMut = useMutation({
    mutationFn: (payload: {
      segmentId: string;
      updates: { status?: string; capacity?: number; isVisible?: boolean };
    }) => adminUpdateSegment(eventId, payload.segmentId, payload.updates),
    onSuccess: () => {
      toast.success("Segment updated");
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["admin-event-overview", eventId] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const segments = data?.segments ?? [];

  if (isLoading) return <p className="text-zinc-500">Loading segments…</p>;

  return (
    <div className="glass-panel overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.08] text-xs text-zinc-500">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Capacity</th>
            <th className="px-4 py-3">Sold</th>
            <th className="px-4 py-3">Remaining</th>
            <th className="px-4 py-3">Revenue</th>
            <th className="px-4 py-3">Check-in</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((s) => (
            <tr key={s.segmentId} className="border-b border-white/[0.04]">
              <td className="px-4 py-3 text-white">
                {s.name}
                {s.isFree && (
                  <span className="ml-2 rounded bg-emerald-500/20 px-1.5 text-xs text-emerald-300">
                    Free
                  </span>
                )}
              </td>
              <td className="px-4 py-3">৳{s.price.toLocaleString()}</td>
              <td className="px-4 py-3">
                {editingId === s.segmentId ? (
                  <input
                    type="number"
                    min={s.sold}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className={cn(selectClass, "w-24")}
                  />
                ) : (
                  s.capacity
                )}
              </td>
              <td className="px-4 py-3">{s.sold}</td>
              <td className="px-4 py-3">{s.remaining}</td>
              <td className="px-4 py-3">৳{s.revenue.toLocaleString()}</td>
              <td className="px-4 py-3">{s.checkInCount}</td>
              <td className="px-4 py-3 capitalize text-zinc-400">{s.status}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {editingId === s.segmentId ? (
                    <>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={selectClass}
                      >
                        <option value="active">Active</option>
                        <option value="soldout">Sold out</option>
                        <option value="hidden">Hidden</option>
                        <option value="expired">Expired</option>
                      </select>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateMut.mutate({
                            segmentId: s.segmentId,
                            updates: {
                              status,
                              capacity: capacity ? Number(capacity) : undefined,
                            },
                          })
                        }
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingId(s.segmentId);
                          setCapacity(String(s.capacity));
                          setStatus(s.status);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={adminRoutes.eventBookings(eventId, s.segmentId)}>Bookings</Link>
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
