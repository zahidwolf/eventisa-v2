import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";
import type { AdminUser } from "@/types/models/admin-user";
import type { LoginFormData } from "@/lib/validators/auth.schema";

export async function adminLogin(data: LoginFormData) {
  const res = await adminApiClient.post<ApiResponse<{ user: AdminUser }>>("/admin/auth/login", data);
  return res.data;
}

export async function adminLogout() {
  const res = await adminApiClient.post<ApiResponse<null>>("/admin/auth/logout");
  return res.data;
}

export async function getAdminMe() {
  const res = await adminApiClient.get<ApiResponse<{ user: AdminUser }>>("/admin/auth/me");
  return res.data;
}

export async function refreshAdminSession() {
  const res = await adminApiClient.post<ApiResponse<{ user: AdminUser }>>("/admin/auth/refresh");
  return res.data;
}
