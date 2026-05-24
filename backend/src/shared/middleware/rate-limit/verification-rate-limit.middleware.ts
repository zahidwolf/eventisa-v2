import rateLimit from "express-rate-limit";

export const resendVerificationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many verification emails requested. Try again later.",
    code: "RATE_LIMIT",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === "string" ? req.body.email.toLowerCase() : "";
    return `${req.ip ?? "unknown"}:${email}`;
  },
});

export const verifyEmailRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many verification attempts. Try again later.",
    code: "RATE_LIMIT",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
