import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import { toOrganizerApplyPayload } from "@/lib/validators/organizer-apply.schema";

export async function applyAsOrganizer(data: {
  organizationName: string;
  email: string;
  phone: string;
}) {
  const res = await apiClient.post<
    ApiResponse<{ organizer: { verificationStatus: string } }>
  >("/organizers/apply", toOrganizerApplyPayload(data));
  return res.data;
}

/** Single request: account + organizer application (email verification required before login). */
export async function registerAndApplyAsOrganizer(data: {
  organizationName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ email: string; requiresVerification: boolean }> {
  const res = await apiClient.post<
    ApiResponse<{
      email: string;
      requiresVerification: boolean;
      organizer: { verificationStatus: string };
    }>
  >("/organizers/register", {
    organizationName: data.organizationName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    password: data.password,
  });

  return {
    email: res.data.data!.email,
    requiresVerification: res.data.data!.requiresVerification,
  };
}
