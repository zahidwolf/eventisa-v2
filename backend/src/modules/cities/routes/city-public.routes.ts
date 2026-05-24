import { Router } from "express";
import * as cityController from "@/modules/cities/controllers/city.controller.js";

const router = Router();

router.get("/", cityController.listPublic);

export default router;
