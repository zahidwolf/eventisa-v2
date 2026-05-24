import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { verifyAdminAccessToken } from "@/shared/utils/admin-jwt.util.js";
import { adminCookieNames } from "@/shared/utils/admin-cookie.util.js";
import type { Role } from "@/shared/enums/role.enum.js";
import type { AdminStaffRole } from "@/shared/enums/admin-staff-role.enum.js";
import { isPortalStaff } from "@/shared/permissions/admin-permissions.js";

export interface AdminAuthUser {
  id: string;
  email: string;
  role: Role;
  staffRole: AdminStaffRole;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminAuthUser;
    }
  }
}

/** Rejects normal user/organizer JWT cookies — admin routes only. */
export function adminAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token =
      req.cookies?.[adminCookieNames.accessToken] ??
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new AppError("Admin authentication required", 401, ErrorCodes.UNAUTHORIZED);
    }

    const payload = verifyAdminAccessToken(token);

    if (!isPortalStaff(payload.role)) {
      throw new AppError("Insufficient admin privileges", 403, ErrorCodes.FORBIDDEN);
    }

    req.admin = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      staffRole: payload.staffRole,
    };

    next();
  } catch (err) {
    next(
      err instanceof AppError
        ? err
        : new AppError("Invalid or expired admin token", 401, ErrorCodes.UNAUTHORIZED)
    );
  }
}
