"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SponsorsEditor } from "@/components/organizer/sponsors-editor";
import { UNIVERSITY_EVENT_TYPES, type EventSponsor, type EventUniversityInfo } from "@/types/models/university";

interface UniversityTabProps {
  university: EventUniversityInfo;
  sponsors: EventSponsor[];
  onUniversity: (v: EventUniversityInfo) => void;
  onSponsors: (v: EventSponsor[]) => void;
}

export function EventBuilderUniversityTab({
  university,
  sponsors,
  onUniversity,
  onSponsors,
}: UniversityTabProps) {
  const set = (patch: Partial<EventUniversityInfo>) => onUniversity({ ...university, ...patch });

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label>Event type</Label>
          <select
            className="flex h-11 w-full rounded-lg border border-white/10 bg-surface-elevated px-3 text-sm"
            value={university.eventType ?? ""}
            onChange={(e) => set({ eventType: e.target.value })}
          >
            <option value="">Select type</option>
            {UNIVERSITY_EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>University</Label>
          <Input
            placeholder="e.g. IUT, BUET, BRAC"
            value={university.universityName ?? ""}
            onChange={(e) => set({ universityName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Input value={university.department ?? ""} onChange={(e) => set({ department: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Club / society</Label>
          <Input value={university.clubName ?? ""} onChange={(e) => set({ clubName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Batch</Label>
          <Input value={university.batch ?? ""} onChange={(e) => set({ batch: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Session</Label>
          <Input value={university.session ?? ""} onChange={(e) => set({ session: e.target.value })} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Allowed email domains (comma-separated)</Label>
          <Input
            placeholder="@iut-dhaka.edu, @buet.ac.bd"
            value={(university.allowedEmailDomains ?? []).join(", ")}
            onChange={(e) =>
              set({
                allowedEmailDomains: e.target.value
                  .split(",")
                  .map((d) => d.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!university.studentOnly}
            onChange={(e) => set({ studentOnly: e.target.checked })}
          />
          Students only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!university.requiresStudentId}
            onChange={(e) => set({ requiresStudentId: e.target.checked })}
          />
          Require student ID at checkout
        </label>
      </div>
      <p className="text-xs text-zinc-500">
        Optional — use for campus events, student-only registration, or sponsor packages. All
        other event types can skip this tab.
      </p>
      <SponsorsEditor sponsors={sponsors} onChange={onSponsors} />
    </div>
  );
}
