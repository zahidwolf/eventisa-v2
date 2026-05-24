"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeOrganizerPassword, deleteOrganizerAccount } from "@/services/organizer/settings.service";
import { getApiErrorMessage } from "@/services/api/client";
import { routes } from "@/config/routes";

function PasswordInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} className="border-white/10 bg-white/5 pr-10" />
        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500" onClick={() => setShow((s) => !s)}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function SecuritySettings() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const reqs = [
    { ok: next.length >= 8, label: "Min 8 characters" },
    { ok: /[0-9]/.test(next), label: "At least one number" },
    { ok: /[A-Z]/.test(next), label: "At least one uppercase" },
  ];

  const savePassword = async () => {
    if (next !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await changeOrganizerPassword({ currentPassword: current, newPassword: next });
      toast.success("Password updated");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrganizerAccount();
      toast.success("Account deleted");
      router.push(routes.home);
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Change password</h3>
        <PasswordInput id="cur" label="Current password" value={current} onChange={setCurrent} />
        <PasswordInput id="new" label="New password" value={next} onChange={setNext} />
        <PasswordInput id="conf" label="Confirm new password" value={confirm} onChange={setConfirm} />
        <ul className="space-y-1 text-sm">
          {reqs.map((r) => (
            <li key={r.label} className={r.ok ? "text-emerald-400" : "text-zinc-500"}>
              {r.ok ? "✅" : "○"} {r.label}
            </li>
          ))}
        </ul>
        <Button onClick={() => void savePassword()} disabled={loading} className="bg-accent-magenta hover:bg-accent-magenta/90">
          Save password
        </Button>
      </div>

      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
        <h3 className="font-semibold text-red-300">Danger zone</h3>
        <p className="mt-2 text-sm text-zinc-400">
          This will remove all your events and data permanently. Not allowed if you have active or upcoming events.
        </p>
        <Button variant="outline" className="mt-4 border-red-500/50 text-red-300" onClick={() => setDeleteOpen(true)}>
          Delete account
        </Button>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0e1a] p-6">
            <h4 className="text-lg font-semibold text-white">Delete account?</h4>
            <p className="mt-2 text-sm text-zinc-400">Type DELETE to confirm.</p>
            <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} className="mt-4 border-white/10 bg-white/5" placeholder="DELETE" />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" className="border-white/15" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" disabled={deleteConfirm !== "DELETE"} onClick={() => void handleDelete()}>
                Delete permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
