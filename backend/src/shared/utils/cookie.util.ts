import type { Response, CookieOptions } from "express";
import { env } from "@/config/env.js";

const isProduction = env.NODE_ENV === "production";

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: "/",
};

export const cookieNames = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
} as const;

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
): void {
  res.cookie(cookieNames.accessToken, accessToken, {
    ...baseOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie(cookieNames.refreshToken, refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(cookieNames.accessToken, baseOptions);
  res.clearCookie(cookieNames.refreshToken, baseOptions);
}
