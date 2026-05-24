import { Router } from "express";
import * as homepagePublicController from "@/modules/homepage/controllers/homepage-public.controller.js";

const router = Router();

router.get("/featured-events", homepagePublicController.listFeaturedEvents);
router.get("/trending-events", homepagePublicController.listTrendingEvents);

export default router;
