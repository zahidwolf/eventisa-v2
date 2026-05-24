"use client";

import { useParams } from "next/navigation";
import { AttendeeDashboard } from "@/components/organizer/attendees/AttendeeDashboard";

export default function AdminEventAttendeesPage() {
  const eventId = useParams().id as string;
  return <AttendeeDashboard eventId={eventId} apiMode="admin" showOrderIdColumn />;
}
