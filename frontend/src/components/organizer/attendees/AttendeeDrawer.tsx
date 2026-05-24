"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getAttendeeById } from "@/services/eventBuilder.service";
import { fetchAdminAttendeeById } from "@/services/admin/admin-event-detail.service";
import type { AttendeeDetailResponse } from "@/types/attendee.types";
import { getApiErrorMessage } from "@/services/api/client";

interface AttendeeDrawerProps {
  eventId: string;
  submissionId: string | null;
  apiMode?: "organizer" | "admin";
  fieldLabels?: Record<string, string>;
  onClose: () => void;
}

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value ?? "—");
}

export function AttendeeDrawer({
  eventId,
  submissionId,
  apiMode = "organizer",
  fieldLabels = {},
  onClose,
}: AttendeeDrawerProps) {
  const [data, setData] = useState<AttendeeDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    const fetcher =
      apiMode === "admin"
        ? () => fetchAdminAttendeeById(eventId, submissionId)
        : () => getAttendeeById(eventId, submissionId);
    fetcher()
      .then(setData)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [eventId, submissionId, apiMode]);

  if (!submissionId) return null;

  const sub = data?.submission;
  const labels: Record<string, string> = {
    ...Object.fromEntries((data?.formFields ?? []).map((f) => [f.key, f.label])),
    ...fieldLabels,
  };
  const answerKeysToShow = new Set((data?.formFields ?? []).map((f) => f.key));

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-gradient-to-b from-[#12121e] to-[#070B1A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-white">Attendee details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && <p className="text-sm text-zinc-500">Loading…</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {sub && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: sub.segmentColor ?? "#9B5CFF" }}
                />
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-300">
                  {sub.segmentName}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-zinc-500">Order ID</p>
                <p className="font-mono text-xs text-zinc-200">{sub.orderId}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-zinc-500">Name</p>
                  <p className="text-white">{sub.name}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Email</p>
                  <p className="text-white break-all">{sub.email}</p>
                </div>
                {sub.phone && (
                  <div>
                    <p className="text-zinc-500">Phone</p>
                    <p className="text-white">{sub.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-zinc-500">Submitted</p>
                  <p className="text-white">
                    {new Date(sub.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {data?.ticket?.qrCodeData && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="mb-2 text-xs text-zinc-500">Ticket QR · {data.ticket.ticketNumber}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.ticket.qrCodeData}
                    alt="Ticket QR code"
                    className="mx-auto h-40 w-40 rounded-lg bg-white p-2"
                  />
                </div>
              )}

              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Form responses
                </p>
                <dl className="space-y-3">
                  {Object.entries(sub.answers)
                    .filter(
                      ([key, value]) =>
                        answerKeysToShow.has(key) && formatAnswer(value) !== "—"
                    )
                    .map(([key, value]) => (
                      <div key={key} className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                        <dt className="text-xs text-zinc-500">{labels[key] ?? key}</dt>
                        <dd className="mt-0.5 text-sm text-zinc-200">{formatAnswer(value)}</dd>
                      </div>
                    ))}
                  {answerKeysToShow.size === 0 && (
                    <p className="text-sm text-zinc-500">No additional required fields were submitted.</p>
                  )}
                </dl>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
