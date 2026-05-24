import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { AdminStaffRole } from "@/shared/enums/admin-staff-role.enum.js";

export function requireSuperAdmin() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.admin?.staffRole !== AdminStaffRole.SuperAdmin) {
      next(new AppError("Super admin access required", 403, ErrorCodes.FORBIDDEN));
      return;
    }
    next();
  };
}
