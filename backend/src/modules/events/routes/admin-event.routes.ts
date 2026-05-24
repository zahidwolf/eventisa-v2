import { Router } from "express";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { requirePermission } from "@/shared/middleware/rbac/admin-permission.middleware.js";
import { AdminPermission } from "@/shared/permissions/admin-permissions.js";
import {
  rejectEventSchema,
  requestChangesSchema,
  moderationSchema,
  adminSegmentOverrideSchema,
} from "@/modules/events/validators/admin-event.validator.js";
import { adminUpdateEventSchema } from "@/modules/events/validators/event.validator.js";
import * as adminEventController from "@/modules/events/controllers/admin-event.controller.js";
import adminEventDetailRoutes from "@/modules/admin/routes/admin-event-detail.routes.js";

const router = Router({ mergeParams: true });

router.get("/", adminEventController.list);
router.get("/pending", adminEventController.listPending);
router.use("/:eventId", adminEventDetailRoutes);
router.get("/:id", adminEventController.getOne);
router.put(
  "/:id",
  requirePermission(AdminPermission.EVENTS_MODERATE),
  validate(adminUpdateEventSchema),
  adminEventController.update
);
router.patch(
  "/:id/approve",
  requirePermission(AdminPermission.EVENTS_MODERATE),
  adminEventController.approve
);
router.patch(
  "/:id/reject",
  requirePermission(AdminPermission.EVENTS_MODERATE),
  validate(rejectEventSchema),
  adminEventController.reject
);
router.patch(
  "/:id/request-changes",
  requirePermission(AdminPermission.EVENTS_MODERATE),
  validate(requestChangesSchema),
  adminEventController.requestChanges
);
router.patch(
  "/:id/moderation",
  requirePermission(AdminPermission.EVENTS_FEATURE),
  validate(moderationSchema),
  adminEventController.updateModeration
);
router.patch(
  "/:id/override",
  requirePermission(AdminPermission.EVENTS_MODERATE),
  validate(adminSegmentOverrideSchema),
  adminEventController.overrideContent
);
router.patch(
  "/:id/unpublish",
  requirePermission(AdminPermission.EVENTS_MODERATE),
  adminEventController.unpublish
);
router.delete(
  "/:id",
  requirePermission(AdminPermission.EVENTS_MODERATE),
  adminEventController.remove
);

export default router;
