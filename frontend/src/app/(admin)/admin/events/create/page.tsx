"use client";

import { EventCreationWizard } from "@/components/organizer/event-builder/EventCreationWizard";

export default function AdminCreateEventPage() {
  return (
    <div className="py-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Create event</h1>
      <EventCreationWizard isAdmin />
    </div>
  );
}
