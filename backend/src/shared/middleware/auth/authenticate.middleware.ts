import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { verifyAccessToken } from "@/shared/utils/jwt.util.js";
import { verifyAdminAccessToken } from "@/shared/utils/admin-jwt.util.js";
import { cookieNames } from "@/shared/utils/cookie.util.js";
import { adminCookieNames } from "@/shared/utils/admin-cookie.util.js";
import type { Role } from "@/shared/enums/role.enum.js";
import { isPortalStaff } from "@/shared/permissions/admin-permissions.js";
import type { AdminAuthUser } from "@/shared/middleware/auth/admin-authenticate.middleware.js";
import { findUserById } from "@/modules/users/services/user.service.js";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function readAccessToken(req: Request): string | undefined {
  return (
    req.cookies?.[cookieNames.accessToken] ??
    req.headers.authorization?.replace("Bearer ", "")
  );
}

function attachUserFromPayload(req: Request, payload: { sub: string; email: string; role: Role }) {
  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}

export function authenticateJwt(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = readAccessToken(req);

    if (!token && req.cookies?.admin_access_token) {
      throw new AppError(
        "Admin session active — sign in with a user account for organizer actions, or open this page in a private window",
        403,
        ErrorCodes.FORBIDDEN
      );
    }

    if (!token) {
      throw new AppError("Authentication required", 401, ErrorCodes.UNAUTHORIZED);
    }

    const payload = verifyAccessToken(token);
    attachUserFromPayload(req, payload);
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(new AppError("Invalid or expired token", 401, ErrorCodes.UNAUTHORIZED));
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = readAccessToken(req);

    if (!token && req.cookies?.admin_access_token) {
      throw new AppError(
        "Admin session active — sign in with a user account for organizer actions, or open this page in a private window",
        403,
        ErrorCodes.FORBIDDEN
      );
    }

    if (!token) {
      throw new AppError("Authentication required", 401, ErrorCodes.UNAUTHORIZED);
    }

    const payload = verifyAccessToken(token);
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

    attachUserFromPayload(req, payload);
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(new AppError("Invalid or expired token", 401, ErrorCodes.UNAUTHORIZED));
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = readAccessToken(req);

    if (token) {
      const payload = verifyAccessToken(token);
      attachUserFromPayload(req, payload);
    }
  } catch {
    // Guest continues without user
  }
  next();
}

/** Uploads and other shared actions: accept buyer/organizer JWT or admin portal JWT. */
export function authenticateUserOrAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const userToken =
    req.cookies?.[cookieNames.accessToken] ??
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.replace("Bearer ", "")
      : undefined);

  if (userToken) {
    try {
      const payload = verifyAccessToken(userToken);
      attachUserFromPayload(req, payload);
      next();
      return;
    } catch {
      /* try admin token below */
    }
  }

  const adminToken =
    req.cookies?.[adminCookieNames.accessToken] ??
    (!userToken && req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.replace("Bearer ", "")
      : undefined);

  if (adminToken) {
    try {
      const payload = verifyAdminAccessToken(adminToken);
      if (!isPortalStaff(payload.role)) {
        throw new AppError("Insufficient admin privileges", 403, ErrorCodes.FORBIDDEN);
      }
      const admin: AdminAuthUser = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        staffRole: payload.staffRole,
      };
      req.admin = admin;
      next();
      return;
    } catch (err) {
      if (err instanceof AppError) {
        next(err);
        return;
      }
    }
  }

  next(new AppError("Authentication required", 401, ErrorCodes.UNAUTHORIZED));
}
