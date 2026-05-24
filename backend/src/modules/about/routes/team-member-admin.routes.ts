import { Router } from "express";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import {
  createTeamMemberSchema,
  updateTeamMemberSchema,
} from "@/modules/about/validators/team-member.validator.js";
import * as teamMemberController from "@/modules/about/controllers/team-member.controller.js";

const router = Router();

router.get("/", teamMemberController.listAdmin);
router.post("/", validate(createTeamMemberSchema), teamMemberController.create);
router.patch("/:id", validate(updateTeamMemberSchema), teamMemberController.update);
router.delete("/:id", teamMemberController.remove);

export default router;
