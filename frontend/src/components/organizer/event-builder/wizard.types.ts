import type { FormField, TicketSegment } from "@/types/eventBuilder.types";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export type EventFormat = "in-person" | "online" | "hybrid";

export type OnlinePlatform = "Zoom" | "Google Meet" | "YouTube" | "Other";

export interface EventWizardState {
  eventId?: string;
  title: string;
  category: string;
  shortDescription: string;
  description: string;
  eventFormat: EventFormat;
  startDate: string;
  endDate: string;
  /** When ticket registration / sales open */
  registrationStart: string;
  /** When ticket registration / sales close */
  registrationEnd: string;
  tags: string;
  coverImage: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  mapUrl: string;
  onlinePlatform: OnlinePlatform;
  streamUrl: string;
  segments: TicketSegment[];
  globalFormFields: FormField[];
  completedSteps: WizardStep[];
}

export const WIZARD_STEPS: { step: WizardStep; label: string }[] = [
  { step: 1, label: "Basic info" },
  { step: 2, label: "Media & venue" },
  { step: 3, label: "Ticket segments" },
  { step: 4, label: "Registration forms" },
  { step: 5, label: "Review & publish" },
];
