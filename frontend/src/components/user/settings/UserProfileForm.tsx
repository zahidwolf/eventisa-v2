"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchUserProfile, patchUserProfile } from "@/services/user/user-dashboard.service";
import { getApiErrorMessage } from "@/services/api/client";

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"] as const;
const BD_PHONE = /^(\+880|880|0)?1[3-9]\d{8}$/;

export function UserProfileForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setPhone(profile.phone ?? "");
    setDateOfBirth(profile.dateOfBirth ?? "");
    setGender(profile.gender ?? "");
  }, [profile]);

  const saveMut = useMutation({
    mutationFn: () =>
      patchUserProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["user-profile"], updated);
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (phone.trim() && !BD_PHONE.test(phone.replace(/[\s-]/g, ""))) {
      toast.error("Enter a valid BD phone (01X-XXXXXXXX)");
      return;
    }
    saveMut.mutate();
  }

  if (isLoading) return <p className="text-sm text-zinc-500">Loading profile…</p>;

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="border-white/10 bg-white/5" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile?.email ?? ""} readOnly disabled className="border-white/10 bg-white/5 opacity-60" />
        <p className="text-xs text-zinc-500">Contact support to change email</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01X-XXXXXXXX"
          className="border-white/10 bg-white/5"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dob">Date of birth (optional)</Label>
        <Input
          id="dob"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="border-white/10 bg-white/5"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender (optional)</Label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
        >
          <option value="">Select…</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={saveMut.isPending} className="bg-[#FF3EA5] hover:bg-[#FF3EA5]/90">
        {saveMut.isPending ? "Saving…" : "Save Profile"}
      </Button>
    </form>
  );
}
