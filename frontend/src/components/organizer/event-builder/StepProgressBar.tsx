"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardStep } from "@/components/organizer/event-builder/wizard.types";
import { WIZARD_STEPS } from "@/components/organizer/event-builder/wizard.types";

interface StepProgressBarProps {
  current: WizardStep;
  completedSteps: WizardStep[];
  hasUnsavedChanges?: boolean;
  onStepClick: (step: WizardStep) => void;
}

export function StepProgressBar({
  current,
  completedSteps,
  hasUnsavedChanges,
  onStepClick,
}: StepProgressBarProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-sm text-zinc-400">
          Step {current} of {WIZARD_STEPS.length}
        </p>
        {hasUnsavedChanges && (
          <span className="flex items-center gap-1.5 text-xs text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Unsaved changes
          </span>
        )}
      </div>
      <ol className="flex flex-wrap gap-1 sm:gap-0">
        {WIZARD_STEPS.map(({ step, label }, index) => {
          const done = completedSteps.includes(step);
          const active = current === step;
          const clickable = done && step !== current;

          return (
            <li key={step} className="flex min-w-0 flex-1 items-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick(step)}
                className={cn(
                  "group flex w-full flex-col items-center gap-1 px-1 py-2 text-center transition sm:px-2",
                  clickable && "cursor-pointer hover:opacity-90",
                  !clickable && !active && "cursor-default opacity-60"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition",
                    active && "border-accent-magenta bg-accent-magenta/20 text-white",
                    done && !active && "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
                    !done && !active && "border-white/15 bg-white/5 text-zinc-500"
                  )}
                >
                  {done && !active ? <Check className="h-4 w-4" /> : step}
                </span>
                <span
                  className={cn(
                    "hidden text-[10px] leading-tight sm:block sm:text-xs",
                    active ? "text-white font-medium" : "text-zinc-500"
                  )}
                >
                  {label}
                </span>
              </button>
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden h-px flex-1 sm:block",
                    completedSteps.includes((step + 1) as WizardStep) || done
                      ? "bg-emerald-500/40"
                      : "bg-white/10"
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
