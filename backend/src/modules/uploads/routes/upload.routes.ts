import { Router } from "express";
import multer from "multer";
import { authenticateUserOrAdmin } from "@/shared/middleware/auth/authenticate.middleware.js";
import { validate } from "@/shared/middleware/validation/validate.middleware.js";
import { uploadConfig } from "@/config/upload.config.js";
import { uploadQuerySchema } from "@/modules/uploads/validators/upload.validator.js";
import * as ctrl from "@/modules/uploads/controllers/upload.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: uploadConfig.maxFileSizeMb * 1024 * 1024 },
});

const router = Router();
router.post(
  "/",
  authenticateUserOrAdmin,
  validate(uploadQuerySchema, "query"),
  upload.single("file"),
  ctrl.uploadFile
);
export default router;
