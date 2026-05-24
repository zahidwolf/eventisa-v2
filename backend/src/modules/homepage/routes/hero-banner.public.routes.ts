import { Router } from "express";
import * as heroBannerController from "@/modules/homepage/controllers/hero-banner.controller.js";

const router = Router();

router.get("/", heroBannerController.listPublic);

export default router;
