import { v2 as cloudinary } from "cloudinary";
import { uploadConfig } from "@/config/upload.config.js";
import { logger } from "@/config/logger.js";

cloudinary.config({
  cloud_name: uploadConfig.cloudinary.cloudName,
  api_key: uploadConfig.cloudinary.apiKey,
  api_secret: uploadConfig.cloudinary.apiSecret,
});

function fullFolder(folder: string): string {
  const base = uploadConfig.cloudinary.folder.replace(/\/$/, "");
  const leaf = folder.replace(/^\//, "");
  return `${base}/${leaf}`;
}

export async function uploadImage(
  file: string,
  folder: string
): Promise<{ url: string; publicId: string }> {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: fullFolder(folder),
      quality: "auto",
      fetch_format: "auto",
      resource_type: "image",
    });
    if (!result.secure_url || !result.public_id) {
      throw new Error("Cloudinary response missing url or public_id");
    }
    return { url: result.secure_url, publicId: result.public_id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cloudinary upload failed";
    throw new Error(`Cloudinary upload failed (${folder}): ${message}`);
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.warn("Cloudinary delete failed", { publicId, err });
  }
}

export async function uploadFromBase64(
  base64: string,
  folder: string
): Promise<{ url: string; publicId: string }> {
  const stripped = base64.replace(/^data:image\/\w+;base64,/, "");
  const dataUri = `data:image/png;base64,${stripped}`;
  return uploadImage(dataUri, folder);
}

export async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  mimeType: string
): Promise<{ url: string; publicId: string }> {
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
  return uploadImage(dataUri, folder);
}
