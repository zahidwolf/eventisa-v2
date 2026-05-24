import { z } from "zod";
import { FOLDER_TO_UPLOAD_TYPE, UploadType } from "@/modules/uploads/constants/upload.constants.js";

const allowedFolders = Object.keys(FOLDER_TO_UPLOAD_TYPE) as [string, ...string[]];

export const uploadQuerySchema = z
  .object({
    type: z.nativeEnum(UploadType).optional(),
    folder: z.enum(allowedFolders).optional(),
  })
  .refine((data) => data.type || data.folder, {
    message: "Either type or folder query param is required",
  });

export function resolveUploadType(query: { type?: UploadType; folder?: string }): UploadType {
  if (query.type) return query.type;
  const fromFolder = query.folder ? FOLDER_TO_UPLOAD_TYPE[query.folder] : undefined;
  if (!fromFolder) {
    throw new Error("Invalid upload folder");
  }
  return fromFolder;
}

export function resolveUploadFolder(query: { type?: UploadType; folder?: string }): string | undefined {
  if (query.folder) return query.folder;
  return undefined;
}
