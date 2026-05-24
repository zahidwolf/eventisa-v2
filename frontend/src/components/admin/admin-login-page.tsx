"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAdminMe, adminLogout } from "@/services/admin/admin-auth.service";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { adminRoutes } from "@/config/admin-routes";

function hasAdminCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith("admin_access_token="));
}

export function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, clearAuth } = useAdminAuthStore();
  const [checking, setChecking] = useState(hasAdminCookie());

  useEffect(() => {
    if (!hasAdminCookie()) {
      setChecking(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setChecking(false);
    }, 4000);

    getAdminMe()
      .then((res) => {
        if (cancelled) return;
        if (res.data?.user) {
          setUser(res.data.user);
          const next = searchParams.get("next") || adminRoutes.dashboard;
          router.replace(next.startsWith("/admin") ? next : adminRoutes.dashboard);
        }
      })
      .catch(async () => {
        if (cancelled) return;
        try {
          await adminLogout();
        } catch {
          /* clear stale cookies */
        }
        clearAuth();
      })
      .finally(() => {
        if (!cancelled) {
          window.clearTimeout(timeout);
          setChecking(false);
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [router, searchParams, setUser, clearAuth]);

  if (checking) {
    return (
      <p className="text-center text-sm text-zinc-500">Checking admin session…</p>
    );
  }

  return <AdminLoginForm />;
}
