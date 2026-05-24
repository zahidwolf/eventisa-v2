import { Router } from "express";
import { requirePermission } from "@/shared/middleware/rbac/admin-permission.middleware.js";
import { AdminPermission } from "@/shared/permissions/admin-permissions.js";
import * as ctrl from "@/modules/admin/controllers/adminAnalytics.controller.js";

const router = Router();

router.get("/overview", requirePermission(AdminPermission.ANALYTICS), ctrl.overview);
router.get("/revenue", requirePermission(AdminPermission.ANALYTICS), ctrl.revenue);
router.get("/tickets", requirePermission(AdminPermission.ANALYTICS), ctrl.tickets);
router.get("/users", requirePermission(AdminPermission.ANALYTICS), ctrl.users);
router.get("/events", requirePermission(AdminPermission.ANALYTICS), ctrl.events);
router.get("/by-category", requirePermission(AdminPermission.ANALYTICS), ctrl.byCategory);
router.get("/by-city", requirePermission(AdminPermission.ANALYTICS), ctrl.byCity);
router.get("/top-events", requirePermission(AdminPermission.ANALYTICS), ctrl.topEvents);
router.get("/top-organizers", requirePermission(AdminPermission.ANALYTICS), ctrl.topOrganizers);
router.get("/order-status", requirePermission(AdminPermission.ANALYTICS), ctrl.orderStatus);
router.get("/recent", requirePermission(AdminPermission.ANALYTICS), ctrl.recent);

export default router;
