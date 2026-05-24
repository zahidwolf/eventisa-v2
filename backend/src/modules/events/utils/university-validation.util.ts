import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import type { EventUniversityInfo } from "@/modules/events/types/university.types.js";

export function validateUniversityRegistration(
  uni: EventUniversityInfo | undefined,
  guest: { email: string; studentId?: string }
) {
  if (!uni) return;
  const domains = uni.allowedEmailDomains ?? [];
  if (domains.length > 0 || uni.studentOnly) {
    const email = guest.email.toLowerCase();
    if (domains.length > 0) {
      const ok = domains.some((d) => email.endsWith((d.startsWith("@") ? d : `@${d}`).toLowerCase()));
      if (!ok) throw new AppError(`University email required (${domains.join(", ")})`, 403, ErrorCodes.FORBIDDEN);
    }
  }
  if (uni.requiresStudentId && !guest.studentId?.trim()) {
    throw new AppError("Student ID required", 400, ErrorCodes.VALIDATION_ERROR);
  }
}
