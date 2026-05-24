"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminManagementPanel } from "@/components/admin/settings/AdminManagement";
import { EventControlSettingsPanel } from "@/components/admin/settings/EventControlSettings";
import { FeeSettingsPanel } from "@/components/admin/settings/FeeSettings";
import { OrganizerControlSettingsPanel } from "@/components/admin/settings/OrganizerControlSettings";
import { PlatformSettingsPanel } from "@/components/admin/settings/PlatformSettings";
import { SecuritySettingsPanel } from "@/components/admin/settings/SecuritySettings";
import { SettingsTabNav } from "@/components/admin/settings/SettingsTabNav";
import { SystemSettingsPanel } from "@/components/admin/settings/SystemSettings";
import { fetchPlatformSettings } from "@/services/admin/admin-settings.service";
import { ADMIN_SETTINGS_STALE_MS } from "@/lib/admin-query";
import { useAdminAuthStore } from "@/store/admin-auth.store";
import type { PlatformSettings, SettingsTab } from "@/types/platform-settings";

export function AdminSettingsView() {
  const user = useAdminAuthStore((s) => s.user);
  const isSuperAdmin = user?.staffRole === "super_admin";
  const readOnly = !isSuperAdmin;

  const [tab, setTab] = useState<SettingsTab>("platform");
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ["admin-platform-settings"],
    queryFn: fetchPlatformSettings,
    staleTime: ADMIN_SETTINGS_STALE_MS,
  });

  const onSaved = () => void refetch();

  if (isLoading || !settings) {
    return <p className="p-8 text-sm text-zinc-500">Loading settings…</p>;
  }

  const renderTab = (s: PlatformSettings) => {
    switch (tab) {
      case "platform":
        return <PlatformSettingsPanel settings={s} readOnly={readOnly} onSaved={onSaved} />;
      case "admins":
        return <AdminManagementPanel />;
      case "fees":
        return <FeeSettingsPanel settings={s} readOnly={readOnly} onSaved={onSaved} />;
      case "events":
        return <EventControlSettingsPanel settings={s} readOnly={readOnly} onSaved={onSaved} />;
      case "organizers":
        return (
          <OrganizerControlSettingsPanel settings={s} readOnly={readOnly} onSaved={onSaved} />
        );
      case "security":
        return <SecuritySettingsPanel settings={s} readOnly={readOnly} onSaved={onSaved} />;
      case "system":
        return <SystemSettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Platform settings"
        description="Configure Eventisa platform behavior, fees, controls, and system health."
      />
      <div className="flex flex-col gap-8 lg:flex-row">
        <SettingsTabNav active={tab} onChange={setTab} isSuperAdmin={isSuperAdmin} />
        <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.02] p-6">
          {renderTab(settings)}
        </div>
      </div>
    </div>
  );
}
