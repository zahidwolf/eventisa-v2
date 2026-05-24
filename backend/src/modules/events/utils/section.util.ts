import type { EventDocument } from "@/modules/events/models/event.model.js";
import type { ITicketSection } from "@/modules/events/models/ticket-section.schema.js";

type SectionSubdoc = ITicketSection & { _id?: { toString(): string } };

export function findTicketSection(event: EventDocument, sectionId: string): SectionSubdoc | null {
  const sections = event.ticketSections as SectionSubdoc[];
  return (
    sections.find((s) => s._id?.toString() === sectionId) ??
    sections.find((s) => s.segmentId === sectionId) ??
    null
  );
}
