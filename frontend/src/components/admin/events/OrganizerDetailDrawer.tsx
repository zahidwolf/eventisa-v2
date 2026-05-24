"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";

interface OrganizerDetailDrawerProps {
  organizerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrganizerDetailDrawer({
  organizerId,
  open,
  onOpenChange,
}: OrganizerDetailDrawerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-organizer", organizerId],
    queryFn: async () => {
      const res = await adminApiClient.get<
        ApiResponse<{ organizers: Array<Record<string, unknown>> }>
      >("/admin/organizers", { params: { limit: 200 } });
      const list = res.data.data?.organizers ?? [];
      return list.find((o) => String(o._id) === organizerId || String(o.id) === organizerId);
    },
    enabled: open && !!organizerId,
  });

  const org = data as { businessName?: string; email?: string; verificationStatus?: string } | undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Organizer</DialogTitle>
        </DialogHeader>
        {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}
        {org && (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">Business name</dt>
              <dd className="text-white">{org.businessName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="text-white">{org.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Status</dt>
              <dd className="capitalize text-white">{org.verificationStatus ?? "—"}</dd>
            </div>
          </dl>
        )}
        {!isLoading && !org && <p className="text-sm text-zinc-500">Organizer not found.</p>}
      </DialogContent>
    </Dialog>
  );
}
