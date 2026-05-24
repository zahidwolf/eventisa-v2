import path from "path";

export const uploadConfig = {
  provider: (process.env.UPLOAD_PROVIDER ?? "local") as "local" | "cloudinary",
  localDir: process.env.UPLOAD_LOCAL_DIR ?? path.join(process.cwd(), "uploads"),
  publicBasePath: process.env.UPLOAD_PUBLIC_BASE ?? "/api/uploads/files",
  maxFileSizeMb: Number(process.env.UPLOAD_MAX_MB ?? 8),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    apiKey: process.env.CLOUDINARY_API_KEY ?? "",
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
    folder: process.env.CLOUDINARY_FOLDER ?? "eventisa",
  },
} as const;
