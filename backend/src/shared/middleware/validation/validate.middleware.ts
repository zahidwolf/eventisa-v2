import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";

type RequestTarget = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: RequestTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join(", ");
      return next(new AppError(message, 400, ErrorCodes.VALIDATION_ERROR));
    }

    req[target] = result.data;
    next();
  };
}
