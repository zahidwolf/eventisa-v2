"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  fetchAdminOrganizers,
  approveOrganizerAdmin,
  rejectOrganizerAdmin,
} from "@/services/admin/admin-platform.service";

export default function AdminOrganizersPendingPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-organizers-pending"],
    queryFn: () => fetchAdminOrganizers({ status: "pending" }),
  });

  const approveMut = useMutation({
    mutationFn: approveOrganizerAdmin,
    onSuccess: () => {
      toast.success("Organizer approved");
      qc.invalidateQueries({ queryKey: ["admin-organizers-pending"] });
      qc.invalidateQueries({ queryKey: ["admin-nav-counts"] });
    },
  });

  const rejectMut = useMutation({
    mutationFn: rejectOrganizerAdmin,
    onSuccess: () => {
      toast.success("Organizer rejected");
      qc.invalidateQueries({ queryKey: ["admin-organizers-pending"] });
    },
  });

  const organizers = data?.data.organizers ?? [];

  return (
    <div>
      <p className="mb-6 text-sm text-zinc-500">Approve organizer applications before they can publish events.</p>
      {isLoading && <p className="text-zinc-500">Loading…</p>}
      <div className="space-y-3">
        {organizers.map((o) => (
          <div
            key={String(o._id)}
            className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-xl p-4"
          >
            <div>
              <p className="font-medium text-white">{String(o.businessName)}</p>
              <p className="text-xs text-zinc-500">{String(o.email)}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => approveMut.mutate(String(o._id))}>
                Approve
              </Button>
              <Button size="sm" variant="secondary" onClick={() => rejectMut.mutate(String(o._id))}>
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
