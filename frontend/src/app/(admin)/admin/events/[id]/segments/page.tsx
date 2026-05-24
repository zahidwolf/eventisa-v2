"use client";

import { useParams } from "next/navigation";
import { AdminSegmentTable } from "@/components/admin/events/AdminSegmentTable";

export default function AdminEventSegmentsPage() {
  const eventId = useParams().id as string;
  return <AdminSegmentTable eventId={eventId} />;
}
