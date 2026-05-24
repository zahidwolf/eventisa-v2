import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { processUpload } from "@/modules/uploads/services/upload.service.js";
import {
  resolveUploadFolder,
  resolveUploadType,
} from "@/modules/uploads/validators/upload.validator.js";

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "No file" });
    return;
  }
  const query = {
    type: req.query.type as Parameters<typeof resolveUploadType>[0]["type"],
    folder: req.query.folder as string | undefined,
  };
  const uploadType = resolveUploadType(query);
  const folder = resolveUploadFolder(query);
  const data = await processUpload(uploadType, req.file, folder);
  res.status(201).json({ success: true, data });
});
