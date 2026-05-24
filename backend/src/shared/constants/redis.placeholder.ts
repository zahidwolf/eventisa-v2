/**
 * TODO: Integrate Redis for session cache, rate-limit store, and refresh-token rotation.
 * Env: REDIS_URL=redis://localhost:6379
 */
export const REDIS_PLACEHOLDER = {
  enabled: false,
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
} as const;
