"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/common/container";
import { UserDashboardNav } from "@/components/user/layout/UserDashboardNav";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLES } from "@/constants/roles";
import { adminRoutes } from "@/config/admin-routes";
import { routes } from "@/config/routes";
import { useAuthStore } from "@/store/auth.store";

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(routes.login);
      return;
    }
    if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
      router.replace(adminRoutes.dashboard);
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <Container className="py-16 pb-24">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
      </Container>
    );
  }

  if (user.role !== ROLES.USER && user.role !== ROLES.ORGANIZER) {
    return (
      <Container className="py-20 text-center text-sm text-zinc-500">
        Redirecting…
      </Container>
    );
  }

  return (
    <Container className="py-10 pb-28 lg:pb-16">
      <div className="flex gap-8">
        <UserDashboardNav />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}
