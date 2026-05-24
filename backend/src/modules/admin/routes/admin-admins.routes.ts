import { Router } from "express";
import { adminAuthenticate } from "@/shared/middleware/auth/admin-authenticate.middleware.js";
import { requireSuperAdmin } from "@/shared/middleware/rbac/require-super-admin.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import * as ctrl from "@/modules/admin/controllers/admin-settings.controller.js";
import {
  inviteAdminSchema,
  changeAdminRoleSchema,
} from "@/modules/admin/validators/admin-settings.validator.js";

const router = Router();

router.use(adminAuthenticate, requireSuperAdmin());

router.get("/", ctrl.listAdmins);
router.post("/invite", validate(inviteAdminSchema), ctrl.inviteAdminHandler);
router.patch("/:id/deactivate", ctrl.deactivateAdminHandler);
router.patch("/:id/role", validate(changeAdminRoleSchema), ctrl.changeRoleHandler);
router.patch("/:id/reset-password", ctrl.resetPasswordHandler);

export default router;
