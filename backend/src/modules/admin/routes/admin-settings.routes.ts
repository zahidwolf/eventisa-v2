import { Router } from "express";
import { adminAuthenticate } from "@/shared/middleware/auth/admin-authenticate.middleware.js";
import { requirePermission } from "@/shared/middleware/rbac/admin-permission.middleware.js";
import { requireSuperAdmin } from "@/shared/middleware/rbac/require-super-admin.middleware.js";
import { AdminPermission } from "@/shared/permissions/admin-permissions.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import * as ctrl from "@/modules/admin/controllers/admin-settings.controller.js";
import {
  patchPlatformSchema,
  patchFeesSchema,
  patchEventControlsSchema,
  patchOrganizerControlsSchema,
  patchSecuritySchema,
  patchTrackingSchema,
} from "@/modules/admin/validators/admin-settings.validator.js";

const router = Router();

router.use(adminAuthenticate);

router.get("/", requirePermission(AdminPermission.SETTINGS), ctrl.getSettings);

router.patch("/platform", requireSuperAdmin(), validate(patchPlatformSchema), ctrl.patchPlatform);
router.patch("/fees", requireSuperAdmin(), validate(patchFeesSchema), ctrl.patchFees);
router.patch("/events", requireSuperAdmin(), validate(patchEventControlsSchema), ctrl.patchEvents);
router.patch(
  "/organizers",
  requireSuperAdmin(),
  validate(patchOrganizerControlsSchema),
  ctrl.patchOrganizers
);
router.patch("/security", requireSuperAdmin(), validate(patchSecuritySchema), ctrl.patchSecurity);
router.patch("/tracking", requireSuperAdmin(), validate(patchTrackingSchema), ctrl.patchTracking);

router.get("/system-health", requirePermission(AdminPermission.SETTINGS), ctrl.systemHealth);
router.post("/clear-cache", requireSuperAdmin(), ctrl.clearCache);
router.get("/activity-log", requirePermission(AdminPermission.SETTINGS), ctrl.activityLog);

export default router;
