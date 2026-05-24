"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ADMIN_PAGE_TITLES, adminRoutes } from "@/config/admin-routes";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import { AdminSidebarToggle } from "@/components/admin/layout/AdminSidebar";

function resolveTitle(pathname: string): string {
  if (ADMIN_PAGE_TITLES[pathname]) return ADMIN_PAGE_TITLES[pathname];
  if (pathname.startsWith("/admin/events/") && pathname !== adminRoutes.eventsPending) {
    return "Event detail";
  }
  return "Admin";
}

export function AdminHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAdminAuthStore((s) => s.user);
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`${adminRoutes.events}?search=${encodeURIComponent(term)}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/[0.06] bg-[#070B1A]/95 px-4 backdrop-blur-xl md:px-6">
      <AdminSidebarToggle onClick={onMenuOpen} />
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-semibold text-white md:text-xl">
          {resolveTitle(pathname)}
        </h1>
      </div>
      <form onSubmit={onSearch} className="hidden max-w-xs flex-1 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events, users…"
            className="h-9 border-white/10 bg-[#151B31] pl-9 text-sm"
          />
        </div>
      </form>
      <button
        type="button"
        className="rounded-lg p-2 text-zinc-500 hover:bg-white/5"
        title="Notifications (coming soon)"
      >
        <Bell className="h-5 w-5" />
      </button>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium text-white">{user?.name}</p>
        <span className="rounded bg-[#9B5CFF]/15 px-1.5 py-0.5 text-[10px] uppercase text-[#9B5CFF]">
          {user?.staffRole?.replace(/_/g, " ")}
        </span>
      </div>
    </header>
  );
}
