import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { uploadConfig } from "@/config/upload.config.js";
import { normalizeMediaUrl } from "@/shared/utils/normalize-media-url.js";
import { deleteImage, uploadFromBase64 } from "@/shared/upload/cloudinary.service.js";

export function isBase64Image(value?: string): boolean {
  return !!value?.startsWith("data:image/");
}

export function isHttpImageUrl(value?: string): boolean {
  return !!value && (value.startsWith("http://") || value.startsWith("https://"));
}

export function extractCloudinaryPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("res.cloudinary.com")) return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx < 0) return null;
    let i = uploadIdx + 1;
    while (i < parts.length) {
      const segment = parts[i];
      if (/^v\d+$/.test(segment) || segment.includes(",")) {
        i += 1;
        continue;
      }
      break;
    }
    const idParts = parts.slice(i);
    if (!idParts.length) return null;
    const last = idParts[idParts.length - 1].replace(/\.[a-zA-Z0-9]+$/, "");
    idParts[idParts.length - 1] = last;
    return idParts.join("/");
  } catch {
    return null;
  }
}

export async function persistMediaImage(
  value: string | undefined,
  folder: string,
  existingPublicId?: string | null
): Promise<{ url?: string; publicId?: string | null }> {
  if (!value?.trim()) return { url: undefined, publicId: null };

  if (isBase64Image(value)) {
    if (uploadConfig.provider !== "cloudinary") {
      throw new AppError(
        "Image uploads must use POST /api/uploads when not using Cloudinary",
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }
    if (existingPublicId) await deleteImage(existingPublicId);
    const uploaded = await uploadFromBase64(value, folder);
    return { url: uploaded.url, publicId: uploaded.publicId };
  }

  const normalized = normalizeMediaUrl(value) ?? value;
  const publicId =
    uploadConfig.provider === "cloudinary" ? extractCloudinaryPublicId(normalized) : null;
  return { url: normalized, publicId: publicId ?? existingPublicId ?? null };
}

export async function replaceMediaIfChanged(
  nextUrl: string | undefined,
  currentUrl: string | undefined,
  currentPublicId: string | undefined | null,
  folder: string
): Promise<{ url?: string; publicId?: string | null }> {
  if (nextUrl === undefined) return { url: currentUrl, publicId: currentPublicId ?? null };
  if (!nextUrl.trim()) {
    if (currentPublicId && uploadConfig.provider === "cloudinary") {
      await deleteImage(currentPublicId);
    }
    return { url: undefined, publicId: null };
  }
  if (isBase64Image(nextUrl)) {
    return persistMediaImage(nextUrl, folder, currentPublicId);
  }
  if (nextUrl !== currentUrl && currentPublicId && uploadConfig.provider === "cloudinary") {
    await deleteImage(currentPublicId);
  }
  if (nextUrl !== currentUrl) {
    return persistMediaImage(nextUrl, folder, null);
  }
  return { url: currentUrl, publicId: currentPublicId ?? null };
}
