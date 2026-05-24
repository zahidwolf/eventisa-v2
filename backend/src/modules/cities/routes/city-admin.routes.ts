import { Router } from "express";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { createCitySchema, updateCitySchema } from "@/modules/cities/validators/city.validator.js";
import * as cityController from "@/modules/cities/controllers/city.controller.js";

const router = Router();

router.get("/", cityController.listAdmin);
router.post("/", validate(createCitySchema), cityController.create);
router.patch("/:id", validate(updateCitySchema), cityController.update);
router.delete("/:id", cityController.remove);

export default router;
