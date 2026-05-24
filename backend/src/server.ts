import { createServer } from "http";
import type { Application } from "express";
import { env } from "@/config/env.js";
import { logger } from "@/config/logger.js";

export function startServer(app: Application) {
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT}`);
    logger.info(`API: http://localhost:${env.PORT}${env.API_PREFIX}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down...`);
    server.close(() => process.exit(0));
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return server;
}
