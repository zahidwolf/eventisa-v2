"use client";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { OrganizerRouteGuard } from "@/components/auth/organizer-route-guard";
import { routes } from "@/config/routes";
import { Calendar, LayoutDashboard, Settings, Wallet, BarChart3, ScanLine } from "lucide-react";

const sidebarItems = [
  { label: "Dashboard", href: routes.organizer.dashboard, icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Events", href: routes.organizer.events, icon: <Calendar className="h-4 w-4" /> },
  { label: "Analytics", href: routes.organizer.analytics, icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Check-in", href: routes.organizer.checkin, icon: <ScanLine className="h-4 w-4" /> },
  { label: "Payouts", href: routes.organizer.payouts, icon: <Wallet className="h-4 w-4" /> },
  { label: "Settings", href: routes.organizer.settings, icon: <Settings className="h-4 w-4" /> },
];

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrganizerRouteGuard>
      <DashboardShell sidebarItems={sidebarItems} title="Organizer">
        {children}
      </DashboardShell>
    </OrganizerRouteGuard>
  );
}
