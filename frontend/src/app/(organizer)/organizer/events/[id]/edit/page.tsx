"use client";

import { useParams } from "next/navigation";
import { EventCreationWizard } from "@/components/organizer/event-builder/EventCreationWizard";

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;

  return <EventCreationWizard eventId={id} />;
}
