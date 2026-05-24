import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorize } from "@/shared/middleware/rbac/authorize.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import * as userController from "@/modules/users/controllers/user.controller.js";
import {
  changePasswordSchema,
  deleteAccountSchema,
  patchUserProfileSchema,
} from "@/modules/users/validators/user.validator.js";

const router = Router();
const buyerAuth = [authenticate, authorize(Role.User, Role.Organizer)];

router.get("/dashboard/stats", ...buyerAuth, userController.getDashboardStats);
router.get("/tickets", ...buyerAuth, userController.listTickets);
router.get("/orders", ...buyerAuth, userController.listOrders);
router.get("/orders/:orderId", ...buyerAuth, userController.getOrderDetail);
router.get("/orders/:orderId/tickets", ...buyerAuth, userController.getOrderTickets);
router.get("/profile", ...buyerAuth, userController.getProfile);
router.patch("/profile", ...buyerAuth, validate(patchUserProfileSchema), userController.patchProfile);
router.post(
  "/change-password",
  ...buyerAuth,
  validate(changePasswordSchema),
  userController.changePassword
);
router.post(
  "/delete-account",
  ...buyerAuth,
  validate(deleteAccountSchema),
  userController.deleteAccount
);

export default router;
