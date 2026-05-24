import { uploadConfig } from "@/config/upload.config.js";
import { LocalUploadProvider } from "@/modules/uploads/providers/local.provider.js";
import { CloudinaryUploadProvider } from "@/modules/uploads/providers/cloudinary.provider.js";
import type { IUploadProvider } from "@/modules/uploads/interfaces/upload-provider.interface.js";

let provider: IUploadProvider | null = null;

export function getUploadProvider(): IUploadProvider {
  if (!provider) {
    provider = uploadConfig.provider === "cloudinary" ? new CloudinaryUploadProvider() : new LocalUploadProvider();
  }
  return provider;
}
