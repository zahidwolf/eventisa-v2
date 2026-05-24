"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldRow, TextInput } from "@/components/admin/settings/settings-form-parts";
import {
  changeAdminStaffRole,
  deactivateAdminStaff,
  fetchAdminActivityLog,
  fetchAdminStaff,
  inviteAdminStaff,
  resetAdminStaffPassword,
} from "@/services/admin/admin-settings.service";
import { getApiErrorMessage } from "@/services/api/client";
import { useAdminAuthStore } from "@/store/admin-auth.store";

export function AdminManagementPanel() {
  const qc = useQueryClient();
  const currentUser = useAdminAuthStore((s) => s.user);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "admin" as "admin" | "super_admin" });

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admin-staff"],
    queryFn: fetchAdminStaff,
  });

  const { data: activity = [] } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: () => fetchAdminActivityLog(20),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin-staff"] });
    void qc.invalidateQueries({ queryKey: ["admin-activity"] });
  };

  const invite = useMutation({
    mutationFn: () => inviteAdminStaff(inviteForm),
    onSuccess: () => {
      toast.success("Admin invited");
      setInviteOpen(false);
      setInviteForm({ name: "", email: "", role: "admin" });
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const runAction = async (label: string, fn: () => Promise<void>) => {
    try {
      await fn();
      toast.success(label);
      invalidate();
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90" onClick={() => setInviteOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Invite admin
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading admins…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-white/5 text-zinc-300">
                  <td className="px-4 py-3">{a.name}</td>
                  <td className="px-4 py-3">{a.email}</td>
                  <td className="px-4 py-3">{a.staffRole}</td>
                  <td className="px-4 py-3">{new Date(a.joinedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 capitalize">{a.status}</td>
                  <td className="px-4 py-3">
                    {a.id !== currentUser?.id && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="text-xs text-zinc-400 hover:text-white"
                          onClick={() =>
                            runAction("Role updated", () =>
                              changeAdminStaffRole(
                                a.id,
                                a.staffRole === "super_admin" ? "admin" : "super_admin"
                              )
                            )
                          }
                        >
                          Toggle role
                        </button>
                        <button
                          type="button"
                          className="text-xs text-zinc-400 hover:text-white"
                          onClick={() =>
                            runAction("Password reset sent", () => resetAdminStaffPassword(a.id))
                          }
                        >
                          Reset password
                        </button>
                        {a.status === "active" && (
                          <button
                            type="button"
                            className="text-xs text-red-400 hover:text-red-300"
                            onClick={() =>
                              runAction("Admin deactivated", () => deactivateAdminStaff(a.id))
                            }
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div>
        <p className="mb-3 text-sm font-medium text-white">Recent admin activity</p>
        <div className="space-y-2">
          {activity.map((log) => (
            <div
              key={log._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm"
            >
              <span className="text-zinc-300">
                {log.adminName} — {log.action.replace(/\./g, " ")}
                {log.targetName ? ` · ${log.targetName}` : ""}
              </span>
              <span className="text-xs text-zinc-500">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
          {activity.length === 0 && (
            <p className="text-sm text-zinc-500">No activity recorded yet.</p>
          )}
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="border-white/10 bg-[#10162A] text-white">
          <DialogHeader>
            <DialogTitle>Invite admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FieldRow label="Full name">
              <TextInput
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="Email">
              <TextInput
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </FieldRow>
            <FieldRow label="Role">
              <select
                value={inviteForm.role}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, role: e.target.value as "admin" | "super_admin" })
                }
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </FieldRow>
            <Button
              className="w-full bg-[#FF3EA5] hover:bg-[#FF3EA5]/90"
              disabled={invite.isPending}
              onClick={() => invite.mutate()}
            >
              Send invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
