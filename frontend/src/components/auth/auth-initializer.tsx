"use client";

import { useEffect } from "react";
import { ROLES } from "@/constants/roles";
import { fetchOrganizerApprovalStatus } from "@/lib/auth/get-dashboard-route";
import { getMe } from "@/services/auth/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function AuthInitializer() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then(async (res) => {
        if (cancelled) return;
        const user = res.data.user;
        if (user.role === ROLES.ORGANIZER) {
          const organizerApprovalStatus =
            user.organizerApprovalStatus ?? (await fetchOrganizerApprovalStatus());
          setUser({ ...user, organizerApprovalStatus });
        } else {
          setUser(user);
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Do not wipe a session established by a concurrent login (race with /auth/me 401).
        if (!useAuthStore.getState().isAuthenticated) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setUser, setLoading]);

  return null;
}
