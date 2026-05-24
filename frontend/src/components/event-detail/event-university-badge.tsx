import { GraduationCap, Shield } from "lucide-react";
import type { EventUniversityInfo } from "@/types/models/university";

export function EventUniversityBadge({ university }: { university?: EventUniversityInfo }) {
  if (!university?.universityName && !university?.eventType && !university?.clubName) return null;

  return (
    <div className="glass-panel flex flex-wrap items-center gap-3 rounded-xl px-4 py-3 text-sm">
      <GraduationCap className="h-5 w-5 text-[#9B5CFF]" />
      <div>
        {university.eventType && <p className="font-semibold">{university.eventType}</p>}
        <p className="text-zinc-400">
          {[university.universityName, university.department, university.clubName]
            .filter(Boolean)
            .join(" · ") || "Event details"}
        </p>
      </div>
      {(university.studentOnly || university.requiresStudentId) && (
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-1 text-xs text-[#FF3EA5]">
          <Shield className="h-3 w-3" />
          {university.requiresStudentId ? "Student ID required" : "Students only"}
        </span>
      )}
      {university.allowedEmailDomains?.length ? (
        <p className="w-full text-xs text-zinc-500">
          Register with: {university.allowedEmailDomains.join(", ")}
        </p>
      ) : null}
    </div>
  );
}
