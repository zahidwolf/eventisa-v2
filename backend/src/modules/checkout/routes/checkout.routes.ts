import { Router } from "express";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { completeCheckoutSchema } from "@/modules/checkout/validators/checkout.validator.js";
import * as checkoutController from "@/modules/checkout/controllers/checkout.controller.js";

const router = Router();

router.post("/complete", validate(completeCheckoutSchema), checkoutController.complete);
// Supports: { paymentId } new flow OR legacy { paymentMethod: "legacy_demo" } without paymentId

export default router;
