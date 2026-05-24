import mongoose from "mongoose";
import { env } from "@/config/env.js";
import { logger } from "@/config/logger.js";

export async function connectDatabase(): Promise<void> {
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    logger.info("MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("MongoDB connection error", err);
  });

  await mongoose.connect(env.MONGO_URI);
  logger.info(`MongoDB: ${mongoose.connection.name}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}
