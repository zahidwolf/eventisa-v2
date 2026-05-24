"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { CheckInResultDetails } from "@/components/organizer/checkin/CheckInResultDetails";
import type { CheckInResult as CheckInResultType } from "@/types/checkIn.types";

interface CheckInResultOverlayProps {
  result: CheckInResultType | null;
  onDismiss: () => void;
}

const STYLES: Record<
  CheckInResultType["status"],
  { bg: string; icon: typeof CheckCircle2; label: string }
> = {
  success: { bg: "bg-emerald-600", icon: CheckCircle2, label: "Checked in" },
  already_checked_in: { bg: "bg-amber-500", icon: AlertTriangle, label: "Already checked in" },
  invalid: { bg: "bg-red-600", icon: XCircle, label: "Invalid ticket" },
  not_found: { bg: "bg-red-700", icon: XCircle, label: "Not found" },
};

export function CheckInResultOverlay({ result, onDismiss }: CheckInResultOverlayProps) {
  if (!result) return null;

  const style = STYLES[result.status];
  const Icon = style.icon;
  const isError = result.status === "invalid" || result.status === "not_found";
  const showDetails = !isError;

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col ${style.bg} text-white`}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 pb-28 pt-10 text-center">
        <Icon className="mb-4 h-16 w-16 shrink-0" strokeWidth={1.5} />
        <p className="text-lg font-semibold uppercase tracking-wide">{style.label}</p>

        {showDetails && (
          <>
            <p className="mt-4 font-display text-3xl font-bold">{result.attendeeName}</p>
            <span
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-sm"
              style={{ borderLeft: `4px solid ${result.segmentColor ?? "#9B5CFF"}` }}
            >
              {result.segmentName}
            </span>
            {result.status === "already_checked_in" && result.firstScanAt && (
              <p className="mt-3 text-sm text-white/90">
                First checked in:{" "}
                {new Date(result.firstScanAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
            <CheckInResultDetails formAnswers={result.formAnswers} />
          </>
        )}

        {isError && (
          <p className="mt-6 max-w-sm px-2 text-sm text-white/90">
            {result.message ?? "This ticket could not be verified."}
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/20 bg-black/20 p-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-14 w-full rounded-xl bg-white text-base font-bold text-zinc-900 shadow-lg active:scale-[0.98]"
        >
          {isError ? "Try Again" : "Next Attendee"}
        </button>
      </div>
    </div>
  );
}
