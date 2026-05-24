"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getAdminMe, adminLogout } from "@/services/admin/admin-auth.service";
import { useAdminAuthStore } from "@/store/admin-auth.store";

const PUBLIC_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

async function clearStaleAdminSession() {
  try {
    await adminLogout();
  } catch {
    /* ignore */
  }
  useAdminAuthStore.getState().clearAuth();
}

export function AdminAuthInitializer() {
  const pathname = usePathname();
  const { setUser, setLoading } = useAdminAuthStore();

  useEffect(() => {
    if (!pathname.startsWith("/admin")) {
      setLoading(false);
      return;
    }

    if (PUBLIC_PATHS.includes(pathname)) {
      setLoading(false);
      return;
    }

    const hasCookie =
      typeof document !== "undefined" &&
      document.cookie.includes("admin_access_token=");
    if (!hasCookie) {
      setLoading(false);
      return;
    }

    getAdminMe()
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          void clearStaleAdminSession();
        }
      })
      .catch(() => {
        void clearStaleAdminSession();
      })
      .finally(() => setLoading(false));
  }, [pathname, setUser, setLoading]);

  return null;
}
