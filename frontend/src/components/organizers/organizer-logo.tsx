"use client";

import Image from "next/image";
import { resolveUploadUrl } from "@/lib/media/resolve-upload-url";
import { cn } from "@/lib/utils";

type OrganizerLogoProps = {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
};

/** Organizer logos may be base64 (settings upload) or HTTP upload URLs. */
export function OrganizerLogo({ src, alt, className, sizes = "56px" }: OrganizerLogoProps) {
  if (!src?.trim()) return null;

  const trimmed = src.trim();
  if (trimmed.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={trimmed} alt={alt} className={cn("h-full w-full object-cover", className)} />
    );
  }

  const resolved = resolveUploadUrl(trimmed);
  const unoptimized = resolved.startsWith("/api/");

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={unoptimized}
      className={cn("object-cover", className)}
    />
  );
}
