import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { uploadConfig } from "@/config/upload.config.js";
import { uploadBuffer } from "@/shared/upload/cloudinary.service.js";
import { UPLOAD_TYPE_FOLDERS } from "@/modules/uploads/constants/upload.constants.js";
import type { IUploadProvider, UploadFileInput, UploadResult } from "@/modules/uploads/interfaces/upload-provider.interface.js";

export class CloudinaryUploadProvider implements IUploadProvider {
  readonly name = "cloudinary";

  async upload(file: UploadFileInput): Promise<UploadResult> {
    const { cloudName, apiKey, apiSecret } = uploadConfig.cloudinary;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new AppError("Cloudinary not configured", 503, ErrorCodes.INTERNAL_ERROR);
    }

    const folder = file.folder ?? UPLOAD_TYPE_FOLDERS[file.uploadType];
    const result = await uploadBuffer(file.buffer, folder, file.mimeType);
    return {
      url: result.url,
      publicId: result.publicId,
      bytes: file.buffer.length,
    };
  }
}
