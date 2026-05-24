import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorizeMinRole } from "@/shared/middleware/rbac/authorize.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import {
  createEventSchema,
  updateEventSchema,
} from "@/modules/events/validators/event.validator.js";
import * as organizerEventController from "@/modules/events/controllers/organizer-event.controller.js";
import segmentBuilderRoutes from "@/modules/events/routes/segmentBuilder.routes.js";
import formEngineRoutes from "@/modules/events/routes/formEngine.routes.js";
import segmentFormRoutes from "@/modules/events/routes/segmentForm.routes.js";
import attendeeDataRoutes from "@/modules/events/routes/attendeeData.routes.js";
import checkInRoutes from "@/modules/events/routes/checkIn.routes.js";
import promoCodeRoutes from "@/modules/events/routes/promoCode.routes.js";

const router = Router();

router.use(authenticate, authorizeMinRole(Role.Organizer));

router.get("/", organizerEventController.list);
router.post("/", validate(createEventSchema), organizerEventController.create);
router.get("/:eventId/overview", organizerEventController.overview);
router.get("/:eventId/analytics", organizerEventController.analytics);
router.post("/:eventId/publish", organizerEventController.publish);
router.post("/:eventId/unpublish", organizerEventController.unpublish);
router.get("/:id", organizerEventController.getOne);
router.put("/:id", validate(updateEventSchema), organizerEventController.update);
router.delete("/:id", organizerEventController.remove);
router.post("/:id/duplicate", organizerEventController.duplicate);
router.post("/:id/submit-for-review", organizerEventController.submitForReview);
router.post("/:id/save-draft", organizerEventController.saveDraft);
router.get("/:id/preview", organizerEventController.preview);
router.use("/:eventId/segments", segmentBuilderRoutes);
router.use("/:eventId/form", formEngineRoutes);
router.use("/:eventId/segments/:segmentId/form", segmentFormRoutes);
router.use("/:eventId/attendees", attendeeDataRoutes);
router.use("/:eventId/checkin", checkInRoutes);
router.use("/:eventId/promo-codes", promoCodeRoutes);

export default router;
