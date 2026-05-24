import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PUBLIC = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

async function isMaintenanceMode(_request: NextRequest): Promise<boolean> {
  try {
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ?? "http://localhost:5001";
    const res = await fetch(`${apiBase}/api/public/platform-status`, {
      cache: "no-store",
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { data?: { maintenanceMode?: boolean } };
    return Boolean(json.data?.maintenanceMode);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isPublic = ADMIN_PUBLIC.some((p) => pathname === p);
    const hasAdminCookie = request.cookies.has("admin_access_token");

    if (!isPublic && !hasAdminCookie) {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  if (pathname === "/maintenance") {
    return NextResponse.next();
  }

  const hasAdminCookie = request.cookies.has("admin_access_token");
  if (!hasAdminCookie && (await isMaintenanceMode(request))) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest).*)"],
};
