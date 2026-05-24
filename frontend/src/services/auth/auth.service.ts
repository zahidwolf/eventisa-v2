import { apiClient, type ApiErrorResponse } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { SafeUser } from "@/types/models/user";
import type { LoginFormData, RegisterFormData } from "@/lib/validators/auth.schema";
import axios from "axios";

export interface RegisterPendingResponse {
  email: string;
  requiresVerification: boolean;
}

export async function register(data: RegisterFormData) {
  const res = await apiClient.post<ApiResponse<RegisterPendingResponse>>("/auth/register", data);
  return res.data;
}

export async function login(data: LoginFormData) {
  const res = await apiClient.post<ApiResponse<{ user: SafeUser }>>("/auth/login", data);
  return res.data;
}

export async function logout() {
  const res = await apiClient.post<ApiResponse<null>>("/auth/logout");
  return res.data;
}

export async function getMe() {
  const res = await apiClient.get<ApiResponse<{ user: SafeUser }>>("/auth/me");
  return res.data;
}

export async function refreshSession() {
  const res = await apiClient.post<ApiResponse<{ user: SafeUser }>>("/auth/refresh");
  return res.data;
}

export async function verifyEmail(data: { token: string; email: string }) {
  const res = await apiClient.post<
    ApiResponse<{ verified: boolean; alreadyVerified?: boolean }>
  >("/auth/verify-email", data);
  return res.data;
}

export async function resendVerificationEmail(email: string) {
  const res = await apiClient.post<ApiResponse<null>>("/auth/resend-verification", { email });
  return res.data;
}

export function isEmailNotVerifiedError(error: unknown): error is { email?: string } {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return false;
  return error.response?.data?.code === "EMAIL_NOT_VERIFIED";
}

export function getEmailNotVerifiedAddress(error: unknown): string | undefined {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return undefined;
  return error.response?.data?.email;
}

export async function forgotPassword(_email: string) {
  const res = await apiClient.post("/auth/forgot-password");
  return res.data;
}
