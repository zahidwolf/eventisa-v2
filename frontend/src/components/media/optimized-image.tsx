"use client";

import Image from "next/image";
import { resolveUploadUrl } from "@/lib/media/resolve-upload-url";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  priority,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: OptimizedImageProps) {
  const resolved = resolveUploadUrl(src);
  const unoptimized = resolved.startsWith("/api/");
  const blur =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 6'%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='1'/%3E%3C/filter%3E%3Crect width='8' height='6' fill='%2312121a' filter='url(%23b)'/%3E%3C/svg%3E";

  return (
    <Image
      src={resolved}
      unoptimized={unoptimized}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      placeholder="blur"
      blurDataURL={blur}
      loading={priority ? undefined : "lazy"}
      priority={priority}
      sizes={sizes}
    />
  );
}
