import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "@/config/env.js";
import type { Role } from "@/shared/enums/role.enum.js";
import type { AdminStaffRole } from "@/shared/enums/admin-staff-role.enum.js";

export const ADMIN_TOKEN_AUDIENCE = "eventisa-admin";

export interface AdminAccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  staffRole: AdminStaffRole;
  aud: typeof ADMIN_TOKEN_AUDIENCE;
}

export interface AdminRefreshTokenPayload {
  sub: string;
  tokenId: string;
  aud: typeof ADMIN_TOKEN_AUDIENCE;
}

const accessOptions: SignOptions = {
  expiresIn: env.JWT_ADMIN_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
};

const refreshOptions: SignOptions = {
  expiresIn: env.JWT_ADMIN_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
};

export function signAdminAccessToken(
  payload: Omit<AdminAccessTokenPayload, "aud">
): string {
  return jwt.sign({ ...payload, aud: ADMIN_TOKEN_AUDIENCE }, env.JWT_ADMIN_ACCESS_SECRET, accessOptions);
}

export function signAdminRefreshToken(
  payload: Omit<AdminRefreshTokenPayload, "aud">
): string {
  return jwt.sign({ ...payload, aud: ADMIN_TOKEN_AUDIENCE }, env.JWT_ADMIN_REFRESH_SECRET, refreshOptions);
}

export function verifyAdminAccessToken(token: string): AdminAccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_ADMIN_ACCESS_SECRET) as AdminAccessTokenPayload;
  if (payload.aud !== ADMIN_TOKEN_AUDIENCE) {
    throw new Error("Invalid admin token audience");
  }
  return payload;
}

export function verifyAdminRefreshToken(token: string): AdminRefreshTokenPayload {
  const payload = jwt.verify(token, env.JWT_ADMIN_REFRESH_SECRET) as AdminRefreshTokenPayload;
  if (payload.aud !== ADMIN_TOKEN_AUDIENCE) {
    throw new Error("Invalid admin refresh audience");
  }
  return payload;
}
