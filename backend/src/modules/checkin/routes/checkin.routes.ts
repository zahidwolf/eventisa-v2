import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorize } from "@/shared/middleware/rbac/authorize.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import {
  checkInStatsQuerySchema,
  manualCheckInSchema,
  scanCheckInSchema,
} from "@/modules/checkin/validators/checkin.validator.js";
import * as ctrl from "@/modules/checkin/controllers/checkin.controller.js";

const router = Router();
const gate = [authenticate, authorize(Role.Organizer, Role.Admin, Role.SuperAdmin)];

router.post("/scan", ...gate, validate(scanCheckInSchema), ctrl.scan);
router.post("/manual", ...gate, validate(manualCheckInSchema), ctrl.manual);
router.get("/stats", ...gate, validate(checkInStatsQuerySchema, "query"), ctrl.stats);

export default router;
