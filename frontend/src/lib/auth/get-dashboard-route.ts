import { ROLES, type Role } from "@/constants/roles";
import { adminRoutes } from "@/config/admin-routes";
import { routes } from "@/config/routes";
import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { SafeUser } from "@/types/models/user";

export type OrganizerApprovalStatus = "pending" | "approved" | "rejected";

export type PostLoginUser = Pick<SafeUser, "role"> & {
  organizerApprovalStatus?: OrganizerApprovalStatus;
};

export async function fetchOrganizerApprovalStatus(): Promise<
  OrganizerApprovalStatus | undefined
> {
  try {
    const res = await apiClient.get<
      ApiResponse<{ organizer: { verificationStatus: OrganizerApprovalStatus } }>
    >("/organizers/me");
    return res.data.data?.organizer?.verificationStatus;
  } catch {
    return undefined;
  }
}

export function getOrganizerHomeRoute(status?: OrganizerApprovalStatus): string {
  if (status === "pending") return routes.organizer.pending;
  if (status === "rejected") return routes.organizer.rejected;
  return routes.organizer.dashboard;
}

/** Post-login and navbar destination from role + organizer approval. */
export function getPostLoginRoute(user: PostLoginUser): string {
  if (!user.role || user.role === ROLES.GUEST) return routes.login;
  if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
    return adminRoutes.dashboard;
  }
  if (user.role === ROLES.ORGANIZER) {
    return getOrganizerHomeRoute(user.organizerApprovalStatus ?? "approved");
  }
  return routes.dashboard;
}

export async function resolvePostLoginRoute(
  user: SafeUser,
  options?: { preferOrganizer?: boolean }
): Promise<string> {
  let status = user.organizerApprovalStatus;

  if (user.role === ROLES.ORGANIZER || options?.preferOrganizer) {
    status ??= await fetchOrganizerApprovalStatus();
    if (user.role === ROLES.ORGANIZER || status) {
      return getOrganizerHomeRoute(status ?? "approved");
    }
  }

  return getPostLoginRoute({ role: user.role, organizerApprovalStatus: status });
}

/** @deprecated Use getPostLoginRoute — kept for call sites passing role only. */
export function getDashboardRoute(
  role?: Role | null,
  organizerApprovalStatus?: OrganizerApprovalStatus
): string {
  return getPostLoginRoute({ role: role ?? ROLES.GUEST, organizerApprovalStatus });
}
