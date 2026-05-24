"use client";

import { useSearchParams } from "next/navigation";
import { AdminEventTable } from "@/components/admin/events/AdminEventTable";

export default function AdminEventsPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? undefined;
  return (
    <div>
      <p className="mb-6 text-sm text-zinc-500">Search, filter, and moderate all platform events.</p>
      <AdminEventTable initialSearch={initialSearch} />
    </div>
  );
}
