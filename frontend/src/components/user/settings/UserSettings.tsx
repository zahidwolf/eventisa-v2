"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { UserProfileForm } from "@/components/user/settings/UserProfileForm";
import { UserPasswordForm } from "@/components/user/settings/UserPasswordForm";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function UserSettings() {
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-white/10">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm transition",
              tab === id
                ? "border-[#FF3EA5] font-medium text-[#FF3EA5]"
                : "border-transparent text-zinc-500 hover:text-white"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "profile" ? <UserProfileForm /> : <UserPasswordForm />}
    </div>
  );
}
