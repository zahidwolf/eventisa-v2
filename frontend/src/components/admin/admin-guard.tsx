"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import { adminRoutes } from "@/config/admin-routes";

const PUBLIC_ADMIN_PATHS = [
  adminRoutes.login,
  adminRoutes.forgotPassword,
  adminRoutes.resetPassword,
];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAdminAuthStore();
  const [redirecting, setRedirecting] = useState(false);

  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname === p);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isPublic) {
      setRedirecting(true);
      const next = pathname !== adminRoutes.login ? `?next=${encodeURIComponent(pathname)}` : "";
      window.location.href = `${adminRoutes.login}${next}`;
      return;
    }

    if (isAuthenticated && pathname === adminRoutes.login) {
      router.replace(adminRoutes.dashboard);
    }
  }, [isAuthenticated, isLoading, isPublic, pathname, router]);

  if (isPublic) {
    return <>{children}</>;
  }

  if (isLoading || redirecting || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070B1A] text-zinc-500">
        {redirecting || !isAuthenticated ? "Redirecting to admin login…" : "Loading control center…"}
      </div>
    );
  }

  return <>{children}</>;
}
