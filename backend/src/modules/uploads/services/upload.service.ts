import path from "path";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import {
  DANGEROUS_EXTENSIONS,
  UPLOAD_TYPE_CONFIG,
  type UploadType,
} from "@/modules/uploads/constants/upload.constants.js";
import { getUploadProvider } from "@/modules/uploads/providers/upload-provider.factory.js";
import { assertBufferMime, optimizeImageBuffer } from "@/modules/uploads/services/image-optimize.service.js";

export async function processUpload(
  type: UploadType,
  file: Express.Multer.File,
  folder?: string
) {
  const cfg = UPLOAD_TYPE_CONFIG[type];
  const ext = path.extname(file.originalname).toLowerCase();
  if (DANGEROUS_EXTENSIONS.includes(ext as (typeof DANGEROUS_EXTENSIONS)[number])) {
    throw new AppError("Extension not allowed", 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (!cfg.mimes.includes(file.mimetype)) {
    throw new AppError("Invalid mime type", 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (file.size > cfg.maxMb * 1024 * 1024) {
    throw new AppError(`Max ${cfg.maxMb}MB`, 400, ErrorCodes.VALIDATION_ERROR);
  }

  let buffer = file.buffer;
  let mime = assertBufferMime(buffer, cfg.mimes);
  if (cfg.isImage) {
    const o = await optimizeImageBuffer(buffer, mime);
    buffer = o.buffer;
    mime = o.mimeType;
  }

  const result = await getUploadProvider().upload({
    buffer,
    originalName: file.originalname,
    mimeType: mime,
    size: buffer.length,
    uploadType: type,
    folder,
  });

  return { url: result.url, publicId: result.publicId, uploadType: type, provider: getUploadProvider().name };
}
