import { Router } from "express";
import * as eventController from "@/modules/events/controllers/event.controller.js";
import promoCodePublicRoutes from "@/modules/events/routes/promoCodePublic.routes.js";
import * as gatewayController from "@/modules/payments/controllers/payment-gateway.controller.js";

const router = Router();

router.get("/", eventController.list);
router.get("/categories", eventController.categories);
router.get("/slug/:slug", eventController.getBySlug);
router.get("/slug/:slug/checkout-form", eventController.getCheckoutForm);
router.get("/:eventId/gateway-info", gatewayController.publicGatewayInfo);
router.use("/:eventId/promo-codes", promoCodePublicRoutes);

export default router;
