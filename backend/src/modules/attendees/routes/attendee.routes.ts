import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorizeMinRole } from "@/shared/middleware/rbac/authorize.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import * as attendeeController from "@/modules/attendees/controllers/attendee.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticate, authorizeMinRole(Role.Organizer));

router.get("/", attendeeController.list);
router.get("/export", attendeeController.exportCsv);

export default router;
