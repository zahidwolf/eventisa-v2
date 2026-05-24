import { Router } from "express";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import {
  initializePaymentSchema,
  verifyPaymentSchema,
  simulateMockSchema,
} from "@/modules/payments/validators/payment.validator.js";
import * as paymentController from "@/modules/payments/controllers/payment.controller.js";
import * as webhookController from "@/modules/payments/controllers/webhook.controller.js";
import * as callbackController from "@/modules/payments/controllers/payment-callback.controller.js";
const router = Router();

router.get("/config", paymentController.getConfig);
router.get("/config/event/:eventId", paymentController.getEventConfig);
router.post("/initialize", validate(initializePaymentSchema), paymentController.initialize);
router.post("/verify", validate(verifyPaymentSchema), paymentController.verify);
router.post("/mock/simulate", validate(simulateMockSchema), paymentController.simulateMock);
router.get("/status/:paymentId", paymentController.getStatus);

router.post("/webhook/sslcommerz", webhookController.sslcommerzWebhook);
router.post("/webhook/bkash", webhookController.bkashWebhook);
router.post("/webhook/nagad", webhookController.nagadWebhook);

router.post("/callback/sslcommerz", callbackController.sslcommerzCallback);
router.post("/callback/bkash", callbackController.bkashCallback);
router.get("/callback/bkash", callbackController.bkashCallback);
router.post("/callback/nagad", callbackController.nagadCallback);

export default router;
