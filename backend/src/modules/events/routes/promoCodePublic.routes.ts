import { Router } from "express";
import { optionalAuthenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import * as promoCodeController from "@/modules/events/controllers/promoCode.controller.js";
import { validatePromoCodeSchema } from "@/modules/events/validators/promoCode.validator.js";

const router = Router({ mergeParams: true });

router.post(
  "/validate",
  optionalAuthenticate,
  validate(validatePromoCodeSchema),
  promoCodeController.validatePublic
);

export default router;
