import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Role } from "@/shared/enums/role.enum.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/shared/utils/jwt.util.js";
import { RefreshToken } from "@/modules/auth/models/refresh-token.model.js";
import type { TokenPairResult } from "@/modules/auth/types/auth.types.js";
import type { LoginInput, RegisterInput } from "@/modules/auth/validators/auth.validator.js";
import {
  createUser,
  emailExists,
  findUserByEmail,
  findUserById,
  toSafeUserEnriched,
} from "@/modules/users/services/user.service.js";
import { UserStatus } from "@/modules/users/types/user.types.js";
import { isPortalStaff } from "@/shared/permissions/admin-permissions.js";
import { sendVerificationEmail } from "@/modules/auth/services/emailVerification.service.js";

const SALT_ROUNDS = 12;

export interface RegisterPendingVerificationResult {
  email: string;
  requiresVerification: true;
  user: Awaited<ReturnType<typeof toSafeUserEnriched>>;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function storeRefreshToken(userId: string, _token: string): Promise<string> {
  const tokenId = crypto.randomUUID();
  const payload = signRefreshToken({ sub: userId, tokenId });
  const tokenHash = hashToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
  });

  return payload;
}

export async function issueTokensForUser(
  userId: string,
  email: string,
  role: Role
): Promise<TokenPairResult> {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }

  if (!user.isVerified && !isPortalStaff(user.role)) {
    throw new AppError(
      "Please verify your email before logging in.",
      403,
      ErrorCodes.EMAIL_NOT_VERIFIED,
      { email: user.email }
    );
  }

  const accessToken = signAccessToken({ sub: userId, email, role });
  const refreshToken = await storeRefreshToken(userId, accessToken);

  return {
    tokens: { accessToken, refreshToken },
    user: await toSafeUserEnriched(user),
  };
}

export async function registerAccountPendingVerification(input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: Role;
}): Promise<RegisterPendingVerificationResult> {
  if (await emailExists(input.email)) {
    throw new AppError("Email already registered", 409, ErrorCodes.CONFLICT);
  }

  const hashed = await hashPassword(input.password);

  const user = await createUser({
    name: input.name,
    email: input.email,
    phone: input.phone,
    password: hashed,
    role: input.role ?? Role.User,
    isVerified: false,
  });

  await sendVerificationEmail(user);

  return {
    email: user.email,
    requiresVerification: true,
    user: await toSafeUserEnriched(user),
  };
}

export async function registerUser(
  input: RegisterInput
): Promise<RegisterPendingVerificationResult> {
  return registerAccountPendingVerification({
    name: input.name,
    email: input.email,
    phone: input.phone,
    password: input.password,
    role: Role.User,
  });
}

export async function loginUser(input: LoginInput): Promise<TokenPairResult> {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new AppError("Invalid email or password", 401, ErrorCodes.UNAUTHORIZED);
  }

  if (user.status !== UserStatus.Active) {
    throw new AppError("Account is not active", 403, ErrorCodes.FORBIDDEN);
  }

  if (isPortalStaff(user.role)) {
    throw new AppError(
      "Staff accounts must sign in via the admin portal at /admin/login",
      403,
      ErrorCodes.FORBIDDEN
    );
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw new AppError("Invalid email or password", 401, ErrorCodes.UNAUTHORIZED);
  }

  if (!user.isVerified) {
    throw new AppError(
      "Please verify your email before logging in.",
      403,
      ErrorCodes.EMAIL_NOT_VERIFIED,
      { email: user.email }
    );
  }

  return issueTokensForUser(user._id.toString(), user.email, user.role);
}

export async function refreshSession(refreshTokenValue: string): Promise<TokenPairResult> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenValue);
  } catch {
    throw new AppError("Invalid refresh token", 401, ErrorCodes.UNAUTHORIZED);
  }

  const tokenHash = hashToken(refreshTokenValue);
  const stored = await RefreshToken.findOne({
    userId: payload.sub,
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!stored) {
    throw new AppError("Refresh token revoked or expired", 401, ErrorCodes.UNAUTHORIZED);
  }

  await RefreshToken.deleteOne({ _id: stored._id });

  const user = await findUserById(payload.sub);
  if (!user) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }

  if (!user.isVerified && !isPortalStaff(user.role)) {
    throw new AppError(
      "Email verification required",
      403,
      ErrorCodes.EMAIL_NOT_VERIFIED,
      { email: user.email }
    );
  }

  return issueTokensForUser(user._id.toString(), user.email, user.role);
}

export async function logoutUser(refreshTokenValue?: string): Promise<void> {
  if (!refreshTokenValue) return;

  try {
    const payload = verifyRefreshToken(refreshTokenValue);
    const tokenHash = hashToken(refreshTokenValue);
    await RefreshToken.deleteMany({ userId: payload.sub, tokenHash });
  } catch {
    // Token already invalid — treat as logged out
  }
}
