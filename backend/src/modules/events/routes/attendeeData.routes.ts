import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorizeMinRole } from "@/shared/middleware/rbac/authorize.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import * as attendeeController from "@/modules/events/controllers/attendeeData.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticate, authorizeMinRole(Role.Organizer));

router.get("/export", attendeeController.exportAttendees);
router.get("/submission/:submissionId", attendeeController.getOne);
router.get("/segment/:segmentId", attendeeController.listBySegment);
router.get("/", attendeeController.list);

export default router;
