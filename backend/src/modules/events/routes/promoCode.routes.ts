import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorizeMinRole } from "@/shared/middleware/rbac/authorize.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import * as promoCodeController from "@/modules/events/controllers/promoCode.controller.js";
import {
  createPromoCodeSchema,
  updatePromoCodeSchema,
} from "@/modules/events/validators/promoCode.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticate, authorizeMinRole(Role.Organizer));

router.post("/", validate(createPromoCodeSchema), promoCodeController.create);
router.get("/", promoCodeController.list);
router.get("/:codeId/stats", promoCodeController.stats);
router.patch("/:codeId", validate(updatePromoCodeSchema), promoCodeController.update);
router.delete("/:codeId", promoCodeController.remove);

export default router;
