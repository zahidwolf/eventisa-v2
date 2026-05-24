"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminConfirmDialog } from "@/components/admin/events/AdminConfirmDialog";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CoverImage } from "@/components/media/cover-image";
import { ImageUpload } from "@/components/media/image-upload";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createTeamMember,
  deleteTeamMember,
  fetchTeamMembersAdmin,
  updateTeamMember,
} from "@/services/admin/team-members.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { TeamMember, TeamMemberInput } from "@/types/models/team-member";

const EMPTY: TeamMemberInput = {
  name: "",
  designation: "",
  description: "",
  imageUrl: "",
  isActive: true,
};

export function TeamMembersManager({ readOnly }: { readOnly: boolean }) {
  const qc = useQueryClient();
  const [modal, setModal] = useState<"create" | TeamMember | null>(null);
  const [form, setForm] = useState<TeamMemberInput>(EMPTY);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin-team-members"],
    queryFn: fetchTeamMembersAdmin,
    enabled: !readOnly,
  });

  useEffect(() => {
    if (modal === "create") setForm(EMPTY);
    else if (modal) {
      setForm({
        name: modal.name,
        designation: modal.designation,
        description: modal.description,
        imageUrl: modal.imageUrl,
        imagePublicId: modal.imagePublicId,
        isActive: modal.isActive,
      });
    }
  }, [modal]);

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["admin-team-members"] });

  const saveMut = useMutation({
    mutationFn: async () => {
      if (modal === "create") return createTeamMember(form);
      if (modal) return updateTeamMember(modal._id, form);
    },
    onSuccess: () => {
      toast.success(modal === "create" ? "Team member added" : "Team member updated");
      setModal(null);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    onSuccess: () => {
      toast.success("Team member removed");
      setDeleteId(null);
      invalidate();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (readOnly) {
    return (
      <div>
        <AdminPageHeader
          title="About page team"
          description="Super admin only — manage Meet the Innovators profiles."
        />
        <p className="mt-6 text-sm text-amber-400/90">Super admin access required to manage team members.</p>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="About page team"
        description="Manage team members shown on the public About Us page under Meet the Innovators."
      />
      <Button type="button" className="mb-6 gap-2" onClick={() => setModal("create")}>
        <Plus className="h-4 w-4" />
        Add member
      </Button>

      {isLoading ? (
        <p className="mt-8 text-sm text-zinc-500">Loading team…</p>
      ) : members.length === 0 ? (
        <p className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-zinc-500">
          No team members yet. Add photos, names, and roles for the About page.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {members.map((member) => (
            <li
              key={member._id}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-zinc-900">
                {member.imageUrl ? (
                  <CoverImage src={member.imageUrl} alt={member.name} fill sizes="64px" className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">{member.name}</p>
                <p className="text-sm text-[#FF3EA5]">{member.designation}</p>
                <p className="line-clamp-2 text-xs text-zinc-500">{member.description}</p>
                <p className="mt-1 text-xs text-zinc-600">{member.isActive ? "Visible" : "Hidden"}</p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setModal(member)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteId(member._id)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={modal !== null} onOpenChange={(open) => !open && setModal(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#12121e]">
          <DialogHeader>
            <DialogTitle>{modal === "create" ? "Add team member" : "Edit team member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <ImageUpload
              label="Photo"
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              uploadType="speaker-image"
              aspectRatio="square"
            />
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                className="border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g. Co-founder & CEO"
                className="border-white/10 bg-white/5"
              />
            </div>
            <div className="space-y-2">
              <Label>Short description</Label>
              <textarea
                className="min-h-[100px] w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="A brief bio (max 500 characters)"
                maxLength={500}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.isActive ?? true}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="accent-[#FF3EA5]"
              />
              Show on About page
            </label>
            <Button
              type="button"
              className="w-full"
              disabled={saveMut.isPending || !form.imageUrl || !form.name.trim()}
              onClick={() => saveMut.mutate()}
            >
              {saveMut.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AdminConfirmDialog
        open={!!deleteId}
        title="Remove team member?"
        description="This person will no longer appear on the About page."
        confirmLabel="Remove"
        destructive
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMut.mutate(deleteId)}
      />
    </div>
  );
}
