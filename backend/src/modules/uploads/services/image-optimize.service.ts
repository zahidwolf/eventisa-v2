import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";

const SIGS: { mime: string; bytes: number[] }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46] },
];

export function assertBufferMime(buffer: Buffer, allowed: readonly string[]): string {
  const allowedNorm = allowed.map((m) => (m === "image/jpg" ? "image/jpeg" : m));
  const hit = SIGS.find(
    (s) => allowedNorm.includes(s.mime) && s.bytes.every((b, i) => buffer[i] === b)
  );
  if (hit) return hit.mime;
  if (allowed.includes("application/pdf") && buffer.slice(0, 4).toString() === "%PDF") return "application/pdf";
  throw new AppError("Invalid file content", 400, ErrorCodes.VALIDATION_ERROR);
}

export async function optimizeImageBuffer(buffer: Buffer, mime: string) {
  try {
    const sharp = (await import("sharp")).default;
    const pipeline = sharp(buffer)
      .rotate()
      .resize(1920, 1920, { fit: "inside", withoutEnlargement: true });

    if (mime === "image/png") {
      return {
        buffer: await pipeline.png({ compressionLevel: 9 }).toBuffer(),
        mimeType: "image/png",
      };
    }
    if (mime === "image/jpeg" || mime === "image/jpg") {
      return {
        buffer: await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer(),
        mimeType: "image/jpeg",
      };
    }
    if (mime === "image/webp") {
      return {
        buffer: await pipeline.webp({ quality: 82 }).toBuffer(),
        mimeType: "image/webp",
      };
    }
    if (mime === "image/gif") {
      return { buffer, mimeType: mime };
    }
    return { buffer, mimeType: mime };
  } catch {
    return { buffer, mimeType: mime };
  }
}
