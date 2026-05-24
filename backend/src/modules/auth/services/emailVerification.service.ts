import crypto from "crypto";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { env } from "@/config/env.js";
import { sendEmail } from "@/shared/email/email.service.js";
import { emailVerificationTemplate } from "@/shared/email/templates/email-verification.template.js";
import { User, type UserDocument } from "@/modules/users/models/user.model.js";
import { findUserByEmail } from "@/modules/users/services/user.service.js";
import { isPortalStaff } from "@/shared/permissions/admin-permissions.js";

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const EXPIRY_HOURS = 24;

export async function generateVerificationToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      emailVerificationToken: token,
      emailVerificationExpiry: expiresAt,
    },
    { new: true }
  ).select("+emailVerificationToken +emailVerificationExpiry");

  if (!user) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }

  return token;
}

export async function sendVerificationEmail(user: UserDocument): Promise<boolean> {
  if (isPortalStaff(user.role)) {
    return true;
  }

  const token = await generateVerificationToken(user._id.toString());
  const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
  const { subject, html } = emailVerificationTemplate({
    userName: user.name,
    verificationUrl,
    expiryHours: String(EXPIRY_HOURS),
  });

  return sendEmail(user.email, subject, html);
}

export async function verifyEmailToken(token: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+emailVerificationToken +emailVerificationExpiry"
  );

  if (!user) {
    throw new AppError("Invalid verification link", 400, ErrorCodes.VALIDATION_ERROR);
  }

  if (user.isVerified) {
    return { alreadyVerified: true as const };
  }

  if (!user.emailVerificationToken || user.emailVerificationToken !== token) {
    throw new AppError("Invalid verification link", 400, ErrorCodes.VALIDATION_ERROR);
  }

  if (!user.emailVerificationExpiry || user.emailVerificationExpiry <= new Date()) {
    throw new AppError(
      "Link expired. Request a new verification email.",
      400,
      ErrorCodes.VALIDATION_ERROR
    );
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save();

  return { alreadyVerified: false as const };
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user || isPortalStaff(user.role)) {
    return;
  }

  if (user.isVerified) {
    throw new AppError("Email already verified", 400, ErrorCodes.VALIDATION_ERROR);
  }

  await sendVerificationEmail(user);
}
