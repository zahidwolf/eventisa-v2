import type { Request, Response, NextFunction } from "express";
import { isMaintenanceMode } from "@/modules/admin/services/platformSettings.service.js";

const BYPASS_PREFIXES = ["/admin", "/auth", "/public/platform-status", "/health"];

export async function maintenanceModeGuard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const path = req.path;
  if (BYPASS_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    next();
    return;
  }

  if (req.cookies?.admin_access_token) {
    next();
    return;
  }

  try {
    const maintenance = await isMaintenanceMode();
    if (maintenance) {
      res.status(503).json({
        success: false,
        code: "MAINTENANCE",
        message: "Eventisa is currently undergoing scheduled maintenance. Please try again later.",
      });
      return;
    }
  } catch {
    /* proceed if settings unavailable */
  }

  next();
}
