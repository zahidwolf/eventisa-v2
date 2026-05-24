import { Router } from "express";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import {
  createHeroBannerSchema,
  updateHeroBannerSchema,
} from "@/modules/homepage/validators/hero-banner.validator.js";
import * as heroBannerController from "@/modules/homepage/controllers/hero-banner.controller.js";

const router = Router();

router.get("/", heroBannerController.listAdmin);
router.post("/", validate(createHeroBannerSchema), heroBannerController.create);
router.patch("/:id", validate(updateHeroBannerSchema), heroBannerController.update);
router.delete("/:id", heroBannerController.remove);

export default router;
