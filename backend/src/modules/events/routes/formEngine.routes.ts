import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorizeMinRole } from "@/shared/middleware/rbac/authorize.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import * as formController from "@/modules/events/controllers/formEngine.controller.js";
import {
  formFieldBodySchema,
  reorderFieldsSchema,
  validateSubmissionSchema,
} from "@/modules/events/validators/event-builder.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticate, authorizeMinRole(Role.Organizer));

router.get("/", formController.listGlobal);
router.post("/", validate(formFieldBodySchema), formController.addGlobalField);
router.patch("/reorder", validate(reorderFieldsSchema), formController.reorderGlobal);
router.post("/validate", validate(validateSubmissionSchema), formController.validateSubmission);
router.patch("/:fieldId", validate(formFieldBodySchema.partial()), formController.updateGlobalField);
router.delete("/:fieldId", formController.deleteGlobalField);

export default router;
