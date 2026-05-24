import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "@/lib/api-base-url";
import type { ApiErrorResponse } from "@/types/api/response";

export const adminApiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

adminApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthRoute = original?.url?.includes("/admin/auth/");

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        await adminApiClient.post("/admin/auth/refresh");
        return adminApiClient(original);
      } catch {
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin/login")) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
