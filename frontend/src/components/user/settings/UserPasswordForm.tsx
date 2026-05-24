"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { changeUserPassword, deleteUserAccount } from "@/services/user/user-dashboard.service";
import { getApiErrorMessage } from "@/services/api/client";
import { useAuthStore } from "@/store/auth.store";
import { routes } from "@/config/routes";

function checkRequirements(password: string) {
  return {
    length: password.length >= 8,
    number: /\d/.test(password),
    upper: /[A-Z]/.test(password),
  };
}

export function UserPasswordForm() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const reqs = checkRequirements(newPassword);

  const passwordMut = useMutation({
    mutationFn: () => changeUserPassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMut = useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: () => {
      clearAuth();
      router.replace(routes.home);
      toast.success("Account deleted");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reqs.length || !reqs.number || !reqs.upper) {
      toast.error("Password does not meet requirements");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    passwordMut.mutate();
  }

  return (
    <div className="max-w-lg space-y-10">
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <h3 className="font-medium text-white">Change password</h3>
        <div className="space-y-2">
          <Label htmlFor="current">Current password</Label>
          <Input
            id="current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="border-white/10 bg-white/5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new">New password</Label>
          <Input
            id="new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border-white/10 bg-white/5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="border-white/10 bg-white/5"
          />
        </div>
        <ul className="space-y-1 text-xs text-zinc-500">
          <Req ok={reqs.length} label="Min 8 characters" />
          <Req ok={reqs.number} label="At least one number" />
          <Req ok={reqs.upper} label="At least one uppercase" />
        </ul>
        <Button type="submit" disabled={passwordMut.isPending} className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90">
          {passwordMut.isPending ? "Saving…" : "Save Password"}
        </Button>
      </form>

      <section className="rounded-xl border border-red-500/30 p-4">
        <h3 className="font-medium text-red-400">Danger zone</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Permanently delete your account and all associated data.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10"
          onClick={() => setDeleteOpen(true)}
        >
          Delete Account
        </Button>
      </section>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-white/10 bg-[#12121e]">
          <DialogHeader>
            <DialogTitle className="text-white">Delete account?</DialogTitle>
            <DialogDescription>
              All your tickets and order history will be permanently deleted. Type{" "}
              <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
            className="border-white/10 bg-white/5"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== "DELETE" || deleteMut.isPending}
              onClick={() => deleteMut.mutate()}
            >
              {deleteMut.isPending ? "Deleting…" : "Delete forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Req({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={ok ? "text-emerald-400" : ""}>
      {ok ? "✅" : "○"} {label}
    </li>
  );
}
