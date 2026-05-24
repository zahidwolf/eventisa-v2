import { Router } from "express";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { authenticateJwt } from "@/shared/middleware/auth/authenticate.middleware.js";
import { loginRateLimiter } from "@/shared/middleware/rate-limit/auth-rate-limit.middleware.js";
import {
  resendVerificationRateLimiter,
  verifyEmailRateLimiter,
} from "@/shared/middleware/rate-limit/verification-rate-limit.middleware.js";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from "@/modules/auth/validators/auth.validator.js";
import * as authController from "@/modules/auth/controllers/auth.controller.js";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", loginRateLimiter, validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.post(
  "/verify-email",
  verifyEmailRateLimiter,
  validate(verifyEmailSchema),
  authController.verifyEmail
);
router.post(
  "/resend-verification",
  resendVerificationRateLimiter,
  validate(resendVerificationSchema),
  authController.resendVerification
);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/me", authenticateJwt, authController.getMe);

export default router;
