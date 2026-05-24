import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { ROLE_HIERARCHY, type Role } from "@/shared/enums/role.enum.js";

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401, ErrorCodes.UNAUTHORIZED));
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return next(new AppError("Insufficient permissions", 403, ErrorCodes.FORBIDDEN));
    }

    next();
  };
}

export function authorizeMinRole(minRole: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401, ErrorCodes.UNAUTHORIZED));
    }

    const userLevel = ROLE_HIERARCHY[req.user.role];
    const requiredLevel = ROLE_HIERARCHY[minRole];

    if (userLevel < requiredLevel) {
      return next(new AppError("Insufficient permissions", 403, ErrorCodes.FORBIDDEN));
    }

    next();
  };
}
