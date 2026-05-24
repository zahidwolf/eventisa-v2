import { Router } from "express";
import * as teamMemberController from "@/modules/about/controllers/team-member.controller.js";

const router = Router();

router.get("/", teamMemberController.listPublic);

export default router;
