import { AdminPageHeader } from "@/components/admin/admin-page-header";

export function AdminPlaceholder({
  title,
  description = "This module is scaffolded for Phase 7. API wiring continues in the next iteration.",
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] p-10 text-center">
      <AdminPageHeader title={title} description={description} />
      <p className="text-sm text-zinc-600">Premium admin UI shell is active.</p>
    </div>
  );
}
