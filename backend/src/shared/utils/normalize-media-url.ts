/** Store upload paths as same-origin `/api/uploads/...` or preserve external CDN URLs. */
export function normalizeMediaUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith("https://res.cloudinary.com/")) return trimmed;
  if (trimmed.startsWith("/api/uploads/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/api/uploads/")) {
      return parsed.pathname;
    }
  } catch {
    /* not a URL */
  }
  return trimmed;
}

export function normalizeMediaUrlList(urls: string[] | undefined): string[] {
  if (!urls?.length) return [];
  return urls.map((u) => normalizeMediaUrl(u) ?? u).filter(Boolean);
}
