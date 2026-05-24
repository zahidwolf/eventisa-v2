import type { Response, CookieOptions } from "express";
import { env } from "@/config/env.js";

const isProduction = env.NODE_ENV === "production";

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: "/",
};

export const adminCookieNames = {
  accessToken: "admin_access_token",
  refreshToken: "admin_refresh_token",
} as const;

export function setAdminAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie(adminCookieNames.accessToken, accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(adminCookieNames.refreshToken, refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAdminAuthCookies(res: Response): void {
  res.clearCookie(adminCookieNames.accessToken, baseOptions);
  res.clearCookie(adminCookieNames.refreshToken, baseOptions);
}
