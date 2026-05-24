import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorizeMinRole } from "@/shared/middleware/rbac/authorize.middleware.js";
import { authorize } from "@/shared/middleware/rbac/authorize.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import * as segmentController from "@/modules/events/controllers/segmentBuilder.controller.js";
import {
  forceStatusSchema,
  reorderSegmentsSchema,
  segmentBodySchema,
} from "@/modules/events/validators/event-builder.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticate, authorizeMinRole(Role.Organizer));

router.get("/", segmentController.list);
router.post("/", validate(segmentBodySchema), segmentController.create);
router.patch("/reorder", validate(reorderSegmentsSchema), segmentController.reorder);
router.patch(
  "/:segmentId/status",
  authorize(Role.Admin, Role.SuperAdmin),
  validate(forceStatusSchema),
  segmentController.forceStatus
);
router.patch("/:segmentId", validate(segmentBodySchema.partial()), segmentController.update);
router.delete("/:segmentId", segmentController.remove);

export default router;
