import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import {
  signAdminAccessToken,
  signAdminRefreshToken,
  verifyAdminRefreshToken,
} from "@/shared/utils/admin-jwt.util.js";
import { AdminRefreshToken } from "@/modules/admin-auth/models/admin-refresh-token.model.js";
import {
  findUserByEmail,
  findUserById,
  toSafeUser,
} from "@/modules/users/services/user.service.js";
import { UserStatus } from "@/modules/users/types/user.types.js";
import {
  isPortalStaff,
  resolveStaffRole,
} from "@/shared/permissions/admin-permissions.js";
import type { LoginInput } from "@/modules/auth/validators/auth.validator.js";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function storeAdminRefresh(userId: string): Promise<string> {
  const tokenId = crypto.randomUUID();
  const payload = signAdminRefreshToken({ sub: userId, tokenId });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await AdminRefreshToken.create({
    userId,
    tokenHash: hashToken(payload),
    expiresAt,
  });
  return payload;
}

async function issueAdminTokens(userId: string) {
  const user = await findUserById(userId);
  if (!user || !isPortalStaff(user.role)) {
    throw new AppError("Not an admin account", 403, ErrorCodes.FORBIDDEN);
  }
  const staffRole = resolveStaffRole(user.role, user.staffRole);
  if (!staffRole) {
    throw new AppError("Admin staff role not configured", 403, ErrorCodes.FORBIDDEN);
  }
  const accessToken = signAdminAccessToken({
    sub: userId,
    email: user.email,
    role: user.role,
    staffRole,
  });
  const refreshToken = await storeAdminRefresh(userId);
  return {
    tokens: { accessToken, refreshToken },
    user: toSafeUser(user),
  };
}

export async function loginAdmin(input: LoginInput) {
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new AppError("Invalid email or password", 401, ErrorCodes.UNAUTHORIZED);
  }
  if (!isPortalStaff(user.role)) {
    throw new AppError("Invalid email or password", 401, ErrorCodes.UNAUTHORIZED);
  }
  if (user.status !== UserStatus.Active) {
    throw new AppError("Account is suspended", 403, ErrorCodes.FORBIDDEN);
  }
  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    throw new AppError("Invalid email or password", 401, ErrorCodes.UNAUTHORIZED);
  }
  user.lastLoginAt = new Date();
  await user.save();
  return issueAdminTokens(user._id.toString());
}

export async function refreshAdminSession(refreshTokenValue: string) {
  let payload;
  try {
    payload = verifyAdminRefreshToken(refreshTokenValue);
  } catch {
    throw new AppError("Invalid admin refresh token", 401, ErrorCodes.UNAUTHORIZED);
  }
  const stored = await AdminRefreshToken.findOne({
    userId: payload.sub,
    tokenHash: hashToken(refreshTokenValue),
    expiresAt: { $gt: new Date() },
  });
  if (!stored) {
    throw new AppError("Admin session expired", 401, ErrorCodes.UNAUTHORIZED);
  }
  await AdminRefreshToken.deleteOne({ _id: stored._id });
  return issueAdminTokens(payload.sub);
}

export async function logoutAdmin(refreshTokenValue?: string) {
  if (!refreshTokenValue) return;
  try {
    const payload = verifyAdminRefreshToken(refreshTokenValue);
    await AdminRefreshToken.deleteMany({
      userId: payload.sub,
      tokenHash: hashToken(refreshTokenValue),
    });
  } catch {
    /* already logged out */
  }
}

export async function getAdminMe(userId: string) {
  const user = await findUserById(userId);
  if (!user || !isPortalStaff(user.role)) {
    throw new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED);
  }
  return toSafeUser(user);
}
