"use client";

import { cn } from "@/lib/utils";
import type { CheckoutStep } from "@/store/checkout.store";

const STEPS = [
  { num: 1, label: "Tickets" },
  { num: 2, label: "Details" },
  { num: 3, label: "Payment" },
  { num: 4, label: "Confirm" },
] as const;

interface StepProgressProps {
  current: CheckoutStep;
}

export function StepProgress({ current }: StepProgressProps) {
  return (
    <nav className="flex items-center justify-between gap-2">
      {STEPS.map((step, i) => (
        <div key={step.num} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                current >= step.num
                  ? "bg-brand text-white shadow-lg shadow-brand/30"
                  : "border border-surface-border bg-surface-elevated text-muted-foreground"
              )}
            >
              {step.num}
            </div>
            <span
              className={cn(
                "hidden text-xs sm:block",
                current >= step.num ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "mx-2 h-px flex-1",
                current > step.num ? "bg-brand" : "bg-surface-border"
              )}
            />
          )}
        </div>
      ))}
    </nav>
  );
}
