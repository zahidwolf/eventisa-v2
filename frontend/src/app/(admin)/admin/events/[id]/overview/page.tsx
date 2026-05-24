"use client";

import { useParams } from "next/navigation";
import { AdminEventOverview } from "@/components/admin/events/AdminEventOverview";

export default function AdminEventOverviewPage() {
  const eventId = useParams().id as string;
  return <AdminEventOverview eventId={eventId} />;
}
