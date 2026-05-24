import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";

const MAX_BASE64_LENGTH = 3 * 1024 * 1024; // ~2MB file as base64

const DATA_URL_PATTERN = /^data:image\/(jpeg|jpg|png|webp);base64,/i;

export function validateBase64Image(value: string | undefined, field = "Image") {
  if (!value) return;
  if (!DATA_URL_PATTERN.test(value) && !value.startsWith("/9j/") && !value.startsWith("iVBOR")) {
    if (!value.startsWith("data:")) {
      throw new AppError(`${field} must be a valid base64 image`, 400, ErrorCodes.VALIDATION_ERROR);
    }
  }
  if (value.length > MAX_BASE64_LENGTH) {
    throw new AppError(`${field} exceeds 2MB limit`, 400, ErrorCodes.VALIDATION_ERROR);
  }
}
