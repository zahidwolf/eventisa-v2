import Link from "next/link";
import type { AdminActivityItem } from "@/services/admin/admin-dashboard.service";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-BD", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminRecentActivity({ items }: { items: AdminActivityItem[] }) {
  return (
    <div className="glass-panel rounded-2xl border border-white/[0.08] p-6">
      <h3 className="font-semibold text-white">Recent activity</h3>
      <ul className="mt-4 max-h-96 space-y-3 overflow-y-auto">
        {items.length === 0 && <li className="text-sm text-zinc-600">No recent activity</li>}
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 text-sm">
            <span className="shrink-0 text-xs text-zinc-600">{formatTime(item.at)}</span>
            {item.href ? (
              <Link href={item.href} className="text-zinc-300 hover:text-[#FF3EA5]">
                {item.message}
              </Link>
            ) : (
              <span className="text-zinc-400">{item.message}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
