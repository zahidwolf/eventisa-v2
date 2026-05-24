/**
 * Upload URLs from the API may point at localhost:5001. The browser should load
 * them via the Next.js /api rewrite (same origin).
 */
export function resolveUploadUrl(url: string | undefined): string {
  if (!url?.trim()) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("/api/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/api/uploads/")) {
      return parsed.pathname;
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}

/** Absolute URL for Open Graph / JSON-LD (server-safe). */
export function toPublicAssetUrl(
  url: string | undefined,
  siteOrigin: string
): string | undefined {
  if (!url?.trim()) return undefined;
  const resolved = resolveUploadUrl(url.trim());
  if (resolved.startsWith("/")) {
    return `${siteOrigin.replace(/\/$/, "")}${resolved}`;
  }
  return resolved;
}

/** Ensure coverImage satisfies backend z.string().url() when persisting. */
export function toAbsoluteUploadUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/") && typeof window !== "undefined") {
    return `${window.location.origin}${trimmed}`;
  }
  return trimmed;
}
