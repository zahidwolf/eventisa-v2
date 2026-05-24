"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { adminRoutes } from "@/config/admin-routes";
import { fetchAdminOrganizers } from "@/services/admin/admin-platform.service";

export default function AdminOrganizersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-organizers"],
    queryFn: () => fetchAdminOrganizers({ status: "approved" }),
  });

  const organizers = data?.data.organizers ?? [];

  return (
    <div>
      <p className="mb-6 text-sm text-zinc-500">
        <Link href={adminRoutes.organizersPending} className="text-[#FF3EA5] hover:underline">
          View pending applications →
        </Link>
      </p>
      {isLoading && <p className="text-zinc-500">Loading…</p>}
      <div className="space-y-2">
        {organizers.map((o) => (
          <div key={String(o._id)} className="glass-panel rounded-xl p-4">
            <p className="font-medium text-white">{String(o.businessName)}</p>
            <p className="text-xs text-zinc-500">{String(o.email)} · {String(o.verificationStatus)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
