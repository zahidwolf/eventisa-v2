import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorizeMinRole } from "@/shared/middleware/rbac/authorize.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import * as checkInController from "@/modules/events/controllers/checkIn.controller.js";
import {
  bulkSyncSchema,
  checkInLogQuerySchema,
  manualCheckInSchema,
  scanCheckInSchema,
  searchCheckInQuerySchema,
} from "@/modules/events/validators/checkIn.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticate, authorizeMinRole(Role.Organizer));

router.get("/search", validate(searchCheckInQuerySchema, "query"), checkInController.search);
router.post("/manual", validate(manualCheckInSchema), checkInController.manual);
router.post("/scan", validate(scanCheckInSchema), checkInController.scan);
router.post("/sync", validate(bulkSyncSchema), checkInController.sync);
router.get("/stats", checkInController.stats);
router.get("/log", validate(checkInLogQuerySchema), checkInController.log);

export default router;
