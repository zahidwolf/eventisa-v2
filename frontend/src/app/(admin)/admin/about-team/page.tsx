"use client";

import { useAdminAuthStore } from "@/store/admin-auth.store";
import { TeamMembersManager } from "@/components/admin/about/TeamMembersManager";

export default function AdminAboutTeamPage() {
  const user = useAdminAuthStore((s) => s.user);
  const readOnly = user?.staffRole !== "super_admin";

  return <TeamMembersManager readOnly={readOnly} />;
}
