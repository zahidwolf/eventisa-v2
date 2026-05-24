import { UserSettings } from "@/components/user/settings/UserSettings";

export default function DashboardSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Account Settings</h1>
      <p className="mt-2 text-sm text-zinc-500">Update your profile and security preferences.</p>
      <div className="mt-8">
        <UserSettings />
      </div>
    </div>
  );
}
