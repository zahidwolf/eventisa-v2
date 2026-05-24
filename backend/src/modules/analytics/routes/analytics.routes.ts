import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorize, authorizeMinRole } from "@/shared/middleware/rbac/authorize.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import * as ctrl from "@/modules/analytics/controllers/analytics.controller.js";

const router = Router();
router.get("/organizer", authenticate, authorize(Role.Organizer, Role.Admin, Role.SuperAdmin), ctrl.organizer);
router.get("/admin", authenticate, authorizeMinRole(Role.Admin), ctrl.admin);
export default router;
