import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorize, authorizeMinRole } from "@/shared/middleware/rbac/authorize.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import {
  createOrganizerSchema,
  registerOrganizerSchema,
} from "@/modules/organizers/validators/organizer.validator.js";
import * as organizerController from "@/modules/organizers/controllers/organizer.controller.js";
import * as settingsController from "@/modules/organizers/controllers/organizerSettings.controller.js";
import * as dashboardController from "@/modules/organizers/controllers/organizer-dashboard.controller.js";
import {
  changePasswordSchema,
  deleteAccountSchema,
  patchBankingSchema,
  patchNotificationPreferencesSchema,
  patchOrganizationSchema,
  patchProfileSchema,
} from "@/modules/organizers/validators/organizer-settings.validator.js";

const router = Router();
const organizerOnly = [authenticate, authorize(Role.Organizer)];

router.get("/slug/:slug", organizerController.getBySlug);
router.post(
  "/register",
  validate(registerOrganizerSchema),
  organizerController.register
);
router.post(
  "/apply",
  authenticate,
  authorize(Role.User, Role.Organizer),
  validate(createOrganizerSchema),
  organizerController.apply
);
router.get("/me", authenticate, authorize(Role.Organizer, Role.Admin, Role.SuperAdmin), organizerController.getMyProfile);

router.get("/settings", ...organizerOnly, settingsController.getSettings);
router.get("/dashboard/stats", ...organizerOnly, dashboardController.dashboardStats);
router.patch("/profile", ...organizerOnly, validate(patchProfileSchema), settingsController.patchProfile);
router.patch(
  "/organization",
  ...organizerOnly,
  validate(patchOrganizationSchema),
  settingsController.patchOrganization
);
router.patch(
  "/notification-preferences",
  ...organizerOnly,
  validate(patchNotificationPreferencesSchema),
  settingsController.patchNotifications
);
router.patch("/banking", ...organizerOnly, validate(patchBankingSchema), settingsController.patchBanking);
router.post(
  "/change-password",
  ...organizerOnly,
  validate(changePasswordSchema),
  settingsController.changePassword
);
router.post(
  "/delete-account",
  ...organizerOnly,
  validate(deleteAccountSchema),
  settingsController.deleteAccount
);

router.get(
  "/pending",
  authenticate,
  authorizeMinRole(Role.Admin),
  organizerController.listPending
);
router.patch(
  "/:id/approve",
  authenticate,
  authorizeMinRole(Role.Admin),
  organizerController.approve
);
router.patch(
  "/:id/reject",
  authenticate,
  authorizeMinRole(Role.Admin),
  organizerController.reject
);

export default router;
