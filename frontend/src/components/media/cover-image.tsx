"use client";

import Image, { type ImageProps } from "next/image";
import { resolveUploadUrl } from "@/lib/media/resolve-upload-url";
import { cn } from "@/lib/utils";

type CoverImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

/** Event banners and other uploads served via the Next.js /api rewrite. */
export function CoverImage({ src, className, ...rest }: CoverImageProps) {
  const resolved = resolveUploadUrl(src);
  if (!resolved) return null;

  // Skip Next image optimizer for uploads and external URLs (avoids 500s on broken remotes).
  const unoptimized =
    resolved.startsWith("/api/") ||
    resolved.startsWith("http://") ||
    resolved.startsWith("https://");

  return (
    <Image
      src={resolved}
      unoptimized={unoptimized}
      className={cn("object-cover", className)}
      {...rest}
    />
  );
}
