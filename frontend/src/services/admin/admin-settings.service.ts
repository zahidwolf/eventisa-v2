import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";
import type {
  AdminActivityRow,
  AdminStaffRow,
  PlatformSettings,
  SystemHealth,
} from "@/types/platform-settings";

export async function fetchPlatformSettings() {
  const res = await adminApiClient.get<ApiResponse<{ settings: PlatformSettings }>>("/admin/settings");
  return res.data.data!.settings;
}

export async function patchPlatformSettings(body: Record<string, unknown>) {
  const res = await adminApiClient.patch<ApiResponse<{ settings: PlatformSettings }>>(
    "/admin/settings/platform",
    body
  );
  return res.data.data!.settings;
}

export async function patchFeeSettings(body: Record<string, unknown>) {
  const res = await adminApiClient.patch<ApiResponse<{ settings: PlatformSettings }>>(
    "/admin/settings/fees",
    body
  );
  return res.data.data!.settings;
}

export async function patchEventControlSettings(body: Record<string, unknown>) {
  const res = await adminApiClient.patch<ApiResponse<{ settings: PlatformSettings }>>(
    "/admin/settings/events",
    body
  );
  return res.data.data!.settings;
}

export async function patchOrganizerControlSettings(body: Record<string, unknown>) {
  const res = await adminApiClient.patch<ApiResponse<{ settings: PlatformSettings }>>(
    "/admin/settings/organizers",
    body
  );
  return res.data.data!.settings;
}

export async function patchSecuritySettings(body: Record<string, unknown>) {
  const res = await adminApiClient.patch<ApiResponse<{ settings: PlatformSettings }>>(
    "/admin/settings/security",
    body
  );
  return res.data.data!.settings;
}

export async function patchTrackingSettings(body: Record<string, unknown>) {
  const res = await adminApiClient.patch<ApiResponse<{ settings: PlatformSettings }>>(
    "/admin/settings/tracking",
    body
  );
  return res.data.data!.settings;
}

export async function fetchSystemHealth() {
  const res = await adminApiClient.get<ApiResponse<SystemHealth>>("/admin/settings/system-health");
  return res.data.data!;
}

export async function clearPlatformCache() {
  const res = await adminApiClient.post<ApiResponse<{ clearedAt: string }>>("/admin/settings/clear-cache");
  return res.data.data!.clearedAt;
}

export async function fetchAdminActivityLog(limit = 20) {
  const res = await adminApiClient.get<ApiResponse<{ logs: AdminActivityRow[] }>>(
    `/admin/settings/activity-log?limit=${limit}`
  );
  return res.data.data!.logs;
}

export async function fetchAdminStaff() {
  const res = await adminApiClient.get<ApiResponse<{ admins: AdminStaffRow[] }>>("/admin/admins");
  return res.data.data!.admins;
}

export async function inviteAdminStaff(body: { name: string; email: string; role: "admin" | "super_admin" }) {
  await adminApiClient.post("/admin/admins/invite", body);
}

export async function deactivateAdminStaff(id: string) {
  await adminApiClient.patch(`/admin/admins/${id}/deactivate`);
}

export async function changeAdminStaffRole(id: string, role: "admin" | "super_admin") {
  await adminApiClient.patch(`/admin/admins/${id}/role`, { role });
}

export async function resetAdminStaffPassword(id: string) {
  await adminApiClient.patch(`/admin/admins/${id}/reset-password`);
}
