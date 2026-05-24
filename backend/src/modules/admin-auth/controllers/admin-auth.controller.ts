import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import {
  loginAdmin,
  logoutAdmin,
  refreshAdminSession,
  getAdminMe,
} from "@/modules/admin-auth/services/admin-auth.service.js";
import {
  setAdminAuthCookies,
  clearAdminAuthCookies,
  adminCookieNames,
} from "@/shared/utils/admin-cookie.util.js";
import { createAuditLog } from "@/modules/audit/services/audit.service.js";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginAdmin(req.body);
  setAdminAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
  await createAuditLog({
    actorId: result.user.id,
    actorEmail: result.user.email,
    action: "admin.login",
    resource: "auth",
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  res.json({ success: true, data: { user: result.user }, message: "Admin login successful" });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await logoutAdmin(req.cookies?.[adminCookieNames.refreshToken]);
  clearAdminAuthCookies(res);
  res.json({ success: true, data: null, message: "Logged out" });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[adminCookieNames.refreshToken];
  if (!token) {
    res.status(401).json({ success: false, message: "No admin refresh token" });
    return;
  }
  const result = await refreshAdminSession(token);
  setAdminAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
  res.json({ success: true, data: { user: result.user } });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await getAdminMe(req.admin!.id);
  res.json({ success: true, data: { user } });
});

export const forgotPassword = asyncHandler(async (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "If the account exists, a reset link will be sent (email integration pending).",
  });
});

export const resetPassword = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, message: "Password reset placeholder — configure email in production." });
});
