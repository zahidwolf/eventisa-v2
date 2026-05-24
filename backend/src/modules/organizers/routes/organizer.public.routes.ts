import { Router } from "express";
import * as organizerController from "@/modules/organizers/controllers/organizer.controller.js";

const router = Router();

router.get("/showcase", organizerController.getShowcase);

export default router;
