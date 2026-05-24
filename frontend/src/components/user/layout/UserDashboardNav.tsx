"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Settings, Ticket } from "lucide-react";
import { InitialAvatar } from "@/components/shared/InitialAvatar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/tickets", label: "My Tickets", icon: Ticket },
  { href: "/dashboard/orders", label: "Orders", icon: Receipt },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function UserDashboardNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-24 rounded-2xl border border-white/[0.08] bg-[#0a0e1a]/80 p-4">
          <div className="mb-4 flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <InitialAvatar name={user?.name ?? "User"} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="truncate text-xs text-zinc-500">{user?.email}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {NAV.map(({ href, label, icon: Icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  isActive(pathname, href, exact)
                    ? "bg-[#FF3EA5]/15 font-medium text-[#FF3EA5]"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#0a0e1a]/95 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                isActive(pathname, href, exact) ? "text-[#FF3EA5]" : "text-zinc-500"
              )}
            >
              <Icon className="h-5 w-5" />
              {label.split(" ")[0]}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
