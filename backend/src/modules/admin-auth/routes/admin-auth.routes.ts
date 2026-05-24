import { Router } from "express";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { loginSchema } from "@/modules/auth/validators/auth.validator.js";
import { adminAuthenticate } from "@/shared/middleware/auth/admin-authenticate.middleware.js";
import * as ctrl from "@/modules/admin-auth/controllers/admin-auth.controller.js";

const router = Router();

router.post("/login", validate(loginSchema), ctrl.login);
router.post("/logout", ctrl.logout);
router.post("/refresh", ctrl.refresh);
router.post("/forgot-password", ctrl.forgotPassword);
router.post("/reset-password", ctrl.resetPassword);
router.get("/me", adminAuthenticate, ctrl.me);

export default router;
