"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormBuilder } from "@/components/organizer/event-builder/FormBuilder";
import { LOCKED_FORM_KEYS } from "@/components/organizer/event-builder/wizard-mappers";
import type { FormField, TicketSegment } from "@/types/eventBuilder.types";

interface FormSetupProps {
  globalFormFields: FormField[];
  segments: TicketSegment[];
  onGlobalChange: (fields: FormField[]) => void;
  onSegmentChange: (segmentId: string, fields: FormField[]) => void;
  /** Admins may remove default name/email fields and clear the global form. */
  allowEditLockedFields?: boolean;
}

function isLockedField(field: FormField): boolean {
  const key = field.fieldId.replace(/^field_/, "");
  return LOCKED_FORM_KEYS.includes(key as (typeof LOCKED_FORM_KEYS)[number]);
}

export function FormSetup({
  globalFormFields,
  segments,
  onGlobalChange,
  onSegmentChange,
  allowEditLockedFields = false,
}: FormSetupProps) {
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);

  const guardedGlobalChange = (fields: FormField[]) => {
    if (allowEditLockedFields) {
      onGlobalChange(fields.map((f, i) => ({ ...f, order: i })));
      return;
    }
    const locked = globalFormFields.filter(isLockedField);
    const lockedIds = new Set(locked.map((f) => f.fieldId));
    const merged = [
      ...locked,
      ...fields.filter((f) => !lockedIds.has(f.fieldId) && !isLockedField(f)),
    ].map((f, i) => ({ ...f, order: i }));
    onGlobalChange(merged);
  };

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Global form</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Questions asked to all ticket buyers regardless of segment.
          </p>
        </div>
        <FormBuilder fields={globalFormFields} onChange={guardedGlobalChange} />
        {!allowEditLockedFields && (
          <p className="text-xs text-zinc-600">
            Full Name and Email are required defaults and cannot be removed.
          </p>
        )}
      </section>

      <section className="space-y-4 border-t border-white/10 pt-8">
        <div>
          <h3 className="text-lg font-semibold text-white">Segment-specific forms</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Extra questions for specific ticket types. Global questions above are always shown.
          </p>
        </div>

        {segments.length === 0 && (
          <p className="text-sm text-zinc-500">Create ticket segments in the previous step first.</p>
        )}

        <div className="space-y-3">
          {segments.map((seg) => {
            const open = expandedSegment === seg.segmentId;
            return (
              <div
                key={seg.segmentId}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  onClick={() => setExpandedSegment(open ? null : seg.segmentId)}
                >
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: seg.ticketColor ?? "#9B5CFF" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white">{seg.name} segment</p>
                    <p className="text-xs text-zinc-500">
                      {seg.formFields.length
                        ? `${seg.formFields.length} extra question(s)`
                        : "Add extra questions for this ticket type"}
                    </p>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
                </button>
                {open ? (
                  <div className="border-t border-white/10 p-4">
                    <FormBuilder
                      segmentId={seg.segmentId}
                      fields={seg.formFields}
                      onChange={(fields) => onSegmentChange(seg.segmentId, fields)}
                    />
                  </div>
                ) : (
                  <div className="border-t border-white/10 px-4 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setExpandedSegment(seg.segmentId)}
                    >
                      <Plus className="h-4 w-4" />
                      Add questions for {seg.name}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
