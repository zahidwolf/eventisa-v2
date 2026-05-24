"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_SECTIONS } from "@/components/admin/layout/admin-nav-config";
import { adminRoutes } from "@/config/admin-routes";
import { fetchAdminNavCounts } from "@/services/admin/admin-platform.service";
import {
  ADMIN_NAV_COUNTS_STALE_MS,
  ADMIN_PENDING_QUEUE_STALE_MS,
} from "@/lib/admin-query";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import { adminLogout } from "@/services/admin/admin-auth.service";

function userInitial(name?: string) {
  return (name?.trim().charAt(0) || "A").toUpperCase();
}

export function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const { user, clearAuth } = useAdminAuthStore();
  const { data: counts } = useQuery({
    queryKey: ["admin-nav-counts"],
    queryFn: fetchAdminNavCounts,
    staleTime: ADMIN_NAV_COUNTS_STALE_MS,
    refetchOnWindowFocus: true,
  });
  const badges = counts?.data ?? {
    pendingEvents: 0,
    pendingOrganizers: 0,
    pendingRefunds: 0,
    pendingPayouts: 0,
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
    } finally {
      clearAuth();
      window.location.href = adminRoutes.login;
    }
  };

  const navContent = (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FF3EA5] to-[#9B5CFF] text-sm font-bold text-white">
          {userInitial(user?.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{user?.name ?? "Admin"}</p>
          <p className="truncate text-xs text-zinc-500">{user?.email}</p>
        </div>
        <button
          type="button"
          className="lg:hidden text-zinc-400"
          onClick={onMobileClose}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {ADMIN_NAV_SECTIONS.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4" : ""}>
            {section.label && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items
                .filter((item) => !item.superAdminOnly || user?.staffRole === "super_admin")
                .map(({ href, label, icon: Icon, badgeKey }) => {
                const active = pathname === href || pathname.startsWith(`${href}/`);
                const badge = badgeKey ? badges[badgeKey] : 0;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onMobileClose}
                    title={label}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                      active
                        ? "bg-[#FF3EA5]/15 font-medium text-[#FF3EA5]"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{label}</span>
                    {badge > 0 && (
                      <span className="rounded-full bg-[#FF3EA5]/20 px-2 py-0.5 text-[10px] font-medium text-[#FF3EA5]">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/[0.06] p-4">
        <p className="text-[10px] uppercase tracking-wide text-[#9B5CFF]">
          {user?.staffRole?.replace(/_/g, " ")}
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0e1a] lg:flex">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF3EA5]">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-sm font-bold text-white">Eventisa Admin</span>
        </div>
        {navContent}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-[#0a0e1a] shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}

export function AdminSidebarToggle({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 lg:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
