"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EventCreationWizard } from "@/components/organizer/event-builder/EventCreationWizard";
import { adminRoutes } from "@/config/admin-routes";

export default function AdminEditEventPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="py-6">
      <Link
        href={adminRoutes.eventOverview(id)}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to event
      </Link>
      <h1 className="mb-6 mt-4 text-2xl font-bold text-white">Edit event</h1>
      <EventCreationWizard eventId={id} isAdmin />
    </div>
  );
}
