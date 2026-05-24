import { Router } from "express";
import { optionalAuthenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import {
  reserveOrderSchema,
  createOrderSchema,
  cancelOrderSchema,
  confirmFreeOrderSchema,
} from "@/modules/orders/validators/order.validator.js";
import * as orderController from "@/modules/orders/controllers/order.controller.js";

const router = Router();

router.post("/reserve", optionalAuthenticate, validate(reserveOrderSchema), orderController.reserve);
router.post("/create", optionalAuthenticate, validate(createOrderSchema), orderController.create);
router.get("/:id", orderController.getById);
router.post("/:id/cancel", validate(cancelOrderSchema), orderController.cancel);
router.post("/:id/confirm-free", validate(confirmFreeOrderSchema), orderController.confirmFree);

export default router;
