import type { UploadType } from "@/modules/uploads/constants/upload.constants.js";

export interface UploadFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  uploadType: UploadType;
  folder?: string;
}

export interface UploadResult {
  url: string;
  publicId?: string;
  format?: string;
  bytes?: number;
}

export interface IUploadProvider {
  readonly name: string;
  upload(file: UploadFileInput): Promise<UploadResult>;
}
