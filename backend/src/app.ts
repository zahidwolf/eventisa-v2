import express from "express";
import path from "path";
import { uploadConfig } from "@/config/upload.config.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { env } from "@/config/env.js";
import apiRoutes from "@/routes/v1/index.js";
import { errorHandler, notFoundHandler } from "@/shared/middleware/error-handler/error-handler.middleware.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (env.NODE_ENV === "production") {
    app.use(
      rateLimit({
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        max: env.RATE_LIMIT_MAX_REQUESTS,
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
  }

  if (uploadConfig.provider === "local") {
    app.use(uploadConfig.publicBasePath, express.static(path.resolve(uploadConfig.localDir)));
  }

  app.use(env.API_PREFIX, apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
