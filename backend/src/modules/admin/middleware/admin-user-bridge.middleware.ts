import type { Request, Response, NextFunction } from "express";

/** Maps `req.admin` to `req.user` so organizer event controllers work on admin routes. */
export function adminUserBridge(req: Request, _res: Response, next: NextFunction): void {
  if (req.admin) {
    req.user = {
      id: req.admin.id,
      email: req.admin.email,
      role: req.admin.role,
    };
  }
  next();
}
