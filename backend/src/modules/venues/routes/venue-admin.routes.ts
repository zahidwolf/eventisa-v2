import { Router } from "express";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { createVenueSchema, updateVenueSchema } from "@/modules/venues/validators/venue.validator.js";
import * as venueController from "@/modules/venues/controllers/venue.controller.js";

const router = Router();

router.get("/", venueController.listAdmin);
router.post("/", validate(createVenueSchema), venueController.create);
router.patch("/:id", validate(updateVenueSchema), venueController.update);
router.delete("/:id", venueController.remove);

export default router;
