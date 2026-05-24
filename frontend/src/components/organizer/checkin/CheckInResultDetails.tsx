"use client";

import type { CheckInFormAnswer } from "@/types/checkIn.types";

interface CheckInResultDetailsProps {
  formAnswers?: CheckInFormAnswer[];
}

export function CheckInResultDetails({ formAnswers }: CheckInResultDetailsProps) {
  const answers = formAnswers ?? [];

  return (
    <div className="mt-4 w-full max-w-md rounded-xl border border-white/20 bg-white/10 p-4 text-left backdrop-blur-sm">
      <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-white/70">
        Attendee Details
      </p>
      {answers.length === 0 ? (
        <p className="text-center text-sm text-white/60">No additional details</p>
      ) : (
        <div className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">
          {answers.map((field) => (
            <div
              key={`${field.label}-${field.value}`}
              className="grid grid-cols-[minmax(0,38%)_1fr] gap-x-3 gap-y-1 border-b border-white/10 pb-2 last:border-0"
            >
              <span className="text-sm text-white/65">{field.label}</span>
              <span className="break-words text-sm font-medium text-white">{field.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
