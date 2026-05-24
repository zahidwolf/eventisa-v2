/**
 * Browser: use same-origin /api (Next.js rewrite → backend).
 * Server (SSR): call backend directly on 5001 (macOS often blocks 5000).
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "/api";
  }
  return (
    process.env.API_URL_INTERNAL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:5001/api"
  );
}
