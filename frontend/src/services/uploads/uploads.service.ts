import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";
import type { UploadType } from "@/constants/upload";

interface UploadData {
  url: string;
  publicId?: string;
  uploadType: string;
  provider: string;
}

export async function uploadFile(
  file: File,
  options: { uploadType?: UploadType; folder?: string }
) {
  const form = new FormData();
  form.append("file", file);
  const params = new URLSearchParams();
  if (options.folder) {
    params.set("folder", options.folder);
  } else if (options.uploadType) {
    params.set("type", options.uploadType);
  }
  const res = await apiClient.post<ApiResponse<UploadData>>(`/uploads?${params.toString()}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
