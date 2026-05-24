import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import {
  hasPermission,
  type AdminPermissionKey,
} from "@/shared/permissions/admin-permissions.js";

export function requirePermission(...permissions: AdminPermissionKey[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const admin = req.admin;
    if (!admin) {
      next(new AppError("Admin authentication required", 401, ErrorCodes.UNAUTHORIZED));
      return;
    }
    const allowed = permissions.some((p) => hasPermission(admin.staffRole, p));
    if (!allowed) {
      next(new AppError("Permission denied", 403, ErrorCodes.FORBIDDEN));
      return;
    }
    next();
  };
}
