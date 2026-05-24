"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/header/site-header";
import { SiteFooter } from "@/components/layout/footer/site-footer";

const MINIMAL_CHROME_PREFIXES = [
  "/login",
  "/register",
  "/check-email",
  "/verify-email",
  "/forgot-password",
  "/organizer/login",
  "/organizer/register",
];

function isOrganizerPortal(pathname: string) {
  return (
    pathname.startsWith("/organizer/") &&
    !pathname.startsWith("/organizer/login") &&
    !pathname.startsWith("/organizer/register")
  );
}

export function RootChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPortal = pathname.startsWith("/admin");
  const isMinimalChrome = MINIMAL_CHROME_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isAdminPortal || isOrganizerPortal(pathname)) {
    return <div className="min-h-screen bg-[#070B1A]">{children}</div>;
  }

  if (isMinimalChrome) {
    return (
      <div className="flex min-h-screen flex-col bg-hero-luxury">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <Link href="/" className="mb-8 font-display text-xl font-bold text-white">
            Eventisa
          </Link>
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-hero-luxury">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
