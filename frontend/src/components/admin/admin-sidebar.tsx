"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/components/admin/admin-nav-config";
import { adminRoutes } from "@/config/admin-routes";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import { adminLogout } from "@/services/admin/admin-auth.service";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAdminAuthStore();

  const handleLogout = async () => {
    try {
      await adminLogout();
    } finally {
      clearAuth();
      window.location.href = adminRoutes.login;
    }
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0e1a]">
      <div className="flex h-16 items-center gap-2 border-b border-white/[0.06] px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF3EA5]">
          <Sparkles className="h-5 w-5 text-white" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Control Center</p>
          <p className="font-display text-sm font-bold text-white">Eventisa Admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-[#FF3EA5]/15 font-medium text-[#FF3EA5]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.06] p-4">
        <p className="truncate text-xs text-zinc-500">{user?.email}</p>
        <p className="text-[10px] uppercase tracking-wide text-[#9B5CFF]">
          {user?.staffRole?.replace("_", " ")}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
