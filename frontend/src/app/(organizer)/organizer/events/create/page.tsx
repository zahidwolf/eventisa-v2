"use client";

import { Container } from "@/components/common/container";
import { EventCreationWizard } from "@/components/organizer/event-builder/EventCreationWizard";

export default function CreateEventPage() {
  return (
    <Container className="py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Create event</h1>
      <EventCreationWizard />
    </Container>
  );
}
