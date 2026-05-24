import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { logger } from "@/config/logger.js";
import { env } from "@/config/env.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.meta ?? {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: err.errors.map((e) => e.message).join(", "),
      code: ErrorCodes.VALIDATION_ERROR,
    });
    return;
  }

  logger.error(err.message, { stack: err.stack });

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === "production" ? "Internal server error" : err.message,
    code: ErrorCodes.INTERNAL_ERROR,
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: ErrorCodes.NOT_FOUND,
  });
}
