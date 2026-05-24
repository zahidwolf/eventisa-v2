import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorizeMinRole } from "@/shared/middleware/rbac/authorize.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import * as formController from "@/modules/events/controllers/formEngine.controller.js";
import {
  formFieldBodySchema,
  reorderFieldsSchema,
} from "@/modules/events/validators/event-builder.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticate, authorizeMinRole(Role.Organizer));

router.post("/", validate(formFieldBodySchema), formController.addSegmentField);
router.patch("/reorder", validate(reorderFieldsSchema), formController.reorderSegment);
router.patch("/:fieldId", validate(formFieldBodySchema.partial()), formController.updateSegmentField);
router.delete("/:fieldId", formController.deleteSegmentField);

export default router;
