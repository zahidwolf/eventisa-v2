import { DashboardSidebar, type SidebarItem } from "@/components/layout/sidebar/dashboard-sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  title?: string;
}

export function DashboardShell({ children, sidebarItems, title }: DashboardShellProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <DashboardSidebar items={sidebarItems} title={title} />
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
