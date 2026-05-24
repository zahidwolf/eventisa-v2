"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface DashboardSidebarProps {
  items: SidebarItem[];
  title?: string;
}

export function DashboardSidebar({ items, title = "Dashboard" }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-surface-border bg-surface-elevated lg:block">
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <nav className="mt-6 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-brand/15 text-brand-light"
                  : "text-muted-foreground hover:bg-surface-card hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
