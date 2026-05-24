import { Router } from "express";
import * as ctrl from "@/modules/payments/controllers/admin-payout.controller.js";

const router = Router();

router.get("/stats", ctrl.stats);
router.get("/", ...ctrl.listValidators, ctrl.list);
router.get("/:id", ctrl.detail);
router.patch("/:id/approve", ctrl.approve);
router.patch("/:id/reject", ...ctrl.rejectValidators, ctrl.reject);
router.patch("/:id/paid", ...ctrl.markPaidValidators, ctrl.markPaid);

export default router;
