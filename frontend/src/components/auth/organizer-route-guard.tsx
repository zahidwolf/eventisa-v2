"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ROLES } from "@/constants/roles";
import { routes } from "@/config/routes";
import { fetchOrganizerApprovalStatus } from "@/lib/auth/get-dashboard-route";
import { useAuthStore } from "@/store/auth.store";

export function OrganizerRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, setUser } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace(routes.organizer.login);
      return;
    }

    const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;

    if (user.role !== ROLES.ORGANIZER && !isStaff) {
      router.replace(routes.dashboard);
      return;
    }

    if (isStaff) {
      setReady(true);
      return;
    }

    let cancelled = false;

    (async () => {
      let status =
        user.organizerApprovalStatus ?? (await fetchOrganizerApprovalStatus());

      if (cancelled) return;

      // Approved organizers with no status payload still reach the dashboard.
      if (!status && user.role === ROLES.ORGANIZER) {
        status = "approved";
      }

      if (status && status !== user.organizerApprovalStatus) {
        setUser({ ...user, organizerApprovalStatus: status });
      }

      const onStatusPage =
        pathname === routes.organizer.pending || pathname === routes.organizer.rejected;

      if (status === "pending" && pathname !== routes.organizer.pending) {
        router.replace(routes.organizer.pending);
        return;
      }
      if (status === "rejected" && pathname !== routes.organizer.rejected) {
        router.replace(routes.organizer.rejected);
        return;
      }
      if (status === "approved" && onStatusPage) {
        router.replace(routes.organizer.dashboard);
        return;
      }

      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, pathname, router, setUser, user]);

  if (isLoading || !ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500">
        Loading organizer portal…
      </div>
    );
  }

  return <>{children}</>;
}
