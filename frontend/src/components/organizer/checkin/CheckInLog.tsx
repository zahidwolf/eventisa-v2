"use client";

import { useCallback, useEffect, useState } from "react";
import { getCheckInLog, type CheckInApiScope } from "@/services/checkIn.service";
import type { CheckInLogEntry, CheckInStatus } from "@/types/checkIn.types";

const BADGE: Record<CheckInStatus, string> = {
  success: "bg-emerald-500/20 text-emerald-300",
  already_checked_in: "bg-amber-500/20 text-amber-300",
  invalid: "bg-red-500/20 text-red-300",
  not_found: "bg-red-500/20 text-red-300",
};

interface CheckInLogProps {
  eventId: string;
  apiScope?: CheckInApiScope;
}

export function CheckInLogTable({ eventId, apiScope = "organizer" }: CheckInLogProps) {
  const [rows, setRows] = useState<CheckInLogEntry[]>([]);
  const [segmentId, setSegmentId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 25;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCheckInLog(
        eventId,
        {
          page,
          limit,
          segmentId: segmentId || undefined,
          status: status || undefined,
        },
        apiScope
      );
      setRows(
        data.rows.map((r) => ({
          ...r,
          scannedAt:
            typeof r.scannedAt === "string" ? r.scannedAt : new Date(r.scannedAt).toISOString(),
        }))
      );
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [eventId, page, segmentId, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const segments = [...new Set(rows.map((r) => r.segmentId))];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          className="min-h-12 rounded-lg border border-white/10 bg-[#12121e] px-3 text-sm"
          value={segmentId}
          onChange={(e) => {
            setSegmentId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All segments</option>
          {segments.map((id) => (
            <option key={id} value={id}>
              {rows.find((r) => r.segmentId === id)?.segmentName ?? id}
            </option>
          ))}
        </select>
        <select
          className="min-h-12 rounded-lg border border-white/10 bg-[#12121e] px-3 text-sm"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="already_checked_in">Already checked in</option>
          <option value="invalid">Invalid</option>
          <option value="not_found">Not found</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-[#12121e] text-left text-zinc-400">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Attendee</th>
              <th className="px-4 py-3">Segment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Device</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-zinc-400">
                    {new Date(r.scannedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-white">{r.attendeeName}</td>
                  <td className="px-4 py-3">{r.segmentName}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${BADGE[r.status]}`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {r.deviceId?.slice(0, 12) ?? "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No scan events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between text-sm text-zinc-500">
        <span>
          Page {page} · {total} total
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="min-h-12 rounded-lg border border-white/15 px-4 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <button
            type="button"
            className="min-h-12 rounded-lg border border-white/15 px-4 disabled:opacity-40"
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
