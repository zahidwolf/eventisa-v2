import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { setAuthCookies, clearAuthCookies, cookieNames } from "@/shared/utils/cookie.util.js";
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from "@/modules/auth/services/auth.service.js";
import {
  resendVerificationEmail,
  verifyEmailToken,
} from "@/modules/auth/services/emailVerification.service.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUser(req.body);

  res.status(201).json({
    success: true,
    data: {
      email: result.email,
      requiresVerification: result.requiresVerification,
    },
    message:
      "Account created! Please check your email to verify your account.",
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

  res.json({
    success: true,
    data: { user: result.user },
    message: "Login successful",
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[cookieNames.refreshToken];
  await logoutUser(refreshToken);
  clearAuthCookies(res);

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies?.[cookieNames.refreshToken] ?? req.body?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ success: false, message: "Refresh token required" });
    return;
  }

  const result = await refreshSession(refreshToken);
  setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

  res.json({
    success: true,
    data: { user: result.user },
    message: "Token refreshed",
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token, email } = req.body;
  const result = await verifyEmailToken(token, email);

  if (result.alreadyVerified) {
    res.json({
      success: true,
      data: { verified: true, alreadyVerified: true },
      message: "Your email is already verified. You can now log in.",
    });
    return;
  }

  res.json({
    success: true,
    data: { verified: true },
    message: "Email verified successfully! You can now log in.",
  });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  try {
    await resendVerificationEmail(req.body.email);
  } catch {
    // Do not reveal whether the email exists or is already verified
  }

  res.json({
    success: true,
    message:
      "If this email is registered, a verification link has been sent.",
  });
});

export const forgotPassword = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "Password reset email not configured yet",
    code: "NOT_IMPLEMENTED",
  });
});

export const resetPassword = asyncHandler(async (_req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "Password reset not configured yet",
    code: "NOT_IMPLEMENTED",
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const { findUserById, toSafeUserEnriched } = await import(
    "@/modules/users/services/user.service.js"
  );
  const user = await findUserById(req.user!.id);

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  res.json({ success: true, data: { user: await toSafeUserEnriched(user) } });
});
