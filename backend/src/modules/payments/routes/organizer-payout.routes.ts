import { Router } from "express";
import { authenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import { authorize } from "@/shared/middleware/rbac/authorize.middleware.js";
import { Role } from "@/shared/enums/role.enum.js";
import * as ctrl from "@/modules/payments/controllers/organizer-payout.controller.js";

const router = Router();
const organizerOnly = [authenticate, authorize(Role.Organizer)];

router.get("/summary", ...organizerOnly, ctrl.summary);
router.get("/payoutable-events", ...organizerOnly, ctrl.payoutableEvents);
router.get("/", ...organizerOnly, ...ctrl.listValidators, ctrl.list);
router.post("/", ...organizerOnly, ...ctrl.createValidators, ctrl.create);
router.get("/:payoutId", ...organizerOnly, ctrl.detail);

export default router;
