import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  JWT_ADMIN_ACCESS_SECRET: z.string().min(32).optional(),
  JWT_ADMIN_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_ADMIN_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_ADMIN_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().url(),
  API_PREFIX: z.string().default("/api"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const data = parsed.data;

export const env = {
  ...data,
  JWT_ADMIN_ACCESS_SECRET:
    data.JWT_ADMIN_ACCESS_SECRET ?? `${data.JWT_ACCESS_SECRET}-admin-portal`,
  JWT_ADMIN_REFRESH_SECRET:
    data.JWT_ADMIN_REFRESH_SECRET ?? `${data.JWT_REFRESH_SECRET}-admin-portal`,
};
