import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { uploadConfig } from "@/config/upload.config.js";
import type { IUploadProvider, UploadFileInput, UploadResult } from "@/modules/uploads/interfaces/upload-provider.interface.js";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export class LocalUploadProvider implements IUploadProvider {
  readonly name = "local";

  async upload(file: UploadFileInput): Promise<UploadResult> {
    const ext =
      EXT_BY_MIME[file.mimeType] ??
      (path.extname(file.originalName).toLowerCase() || ".bin");
    const safeName = `${nanoid(12)}${ext}`;
    const dir = path.join(uploadConfig.localDir, file.uploadType);
    await fs.mkdir(dir, { recursive: true });
    const relative = `${file.uploadType}/${safeName}`;
    await fs.writeFile(path.join(dir, safeName), file.buffer);
    return {
      url: `${uploadConfig.publicBasePath}/${relative}`,
      publicId: relative,
      bytes: file.buffer.length,
    };
  }
}
