import { Router } from "express";
import * as venueController from "@/modules/venues/controllers/venue.controller.js";

const router = Router();

router.get("/", venueController.listPublic);

export default router;
