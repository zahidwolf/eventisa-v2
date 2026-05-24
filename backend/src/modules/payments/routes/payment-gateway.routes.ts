import { Router } from "express";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { requirePermission } from "@/shared/middleware/rbac/admin-permission.middleware.js";
import { AdminPermission } from "@/shared/permissions/admin-permissions.js";
import {
  createGatewaySchema,
  updateGatewaySchema,
} from "@/modules/payments/validators/payment-gateway.validator.js";
import * as gatewayController from "@/modules/payments/controllers/payment-gateway.controller.js";

const router = Router();

router.get(
  "/",
  requirePermission(AdminPermission.PAYMENTS),
  gatewayController.list
);
router.get(
  "/:id",
  requirePermission(AdminPermission.PAYMENTS),
  gatewayController.getOne
);
router.post(
  "/",
  requirePermission(AdminPermission.PAYMENTS),
  validate(createGatewaySchema),
  gatewayController.create
);
router.patch(
  "/:id",
  requirePermission(AdminPermission.PAYMENTS),
  validate(updateGatewaySchema),
  gatewayController.update
);
router.delete(
  "/:id",
  requirePermission(AdminPermission.PAYMENTS),
  gatewayController.remove
);
router.patch(
  "/:id/set-default",
  requirePermission(AdminPermission.PAYMENTS),
  gatewayController.setDefault
);

export default router;
