import { FieldType, type FormField, type TicketSegment } from "@/types/eventBuilder.types";
import type { DynamicFormField, TicketSegment as ApiSegment } from "@/lib/forms/form-field-types";
import type { EventDetail } from "@/types/models/event";
import type { EventWizardState } from "@/components/organizer/event-builder/wizard.types";
import { stripInheritedSegmentSaleTimes } from "@/lib/events/segment-sale-window";
import { resolveUploadUrl, toAbsoluteUploadUrl } from "@/lib/media/resolve-upload-url";

export const LOCKED_FORM_KEYS = ["full_name", "email"] as const;

export function defaultGlobalFormFields(): FormField[] {
  return [
    {
      fieldId: "field_full_name",
      type: FieldType.Text,
      label: "Full Name",
      placeholder: "Your full name",
      required: true,
      order: 0,
    },
    {
      fieldId: "field_email",
      type: FieldType.Email,
      label: "Email",
      placeholder: "you@example.com",
      required: true,
      order: 1,
    },
    {
      fieldId: "field_phone",
      type: FieldType.Phone,
      label: "Phone Number",
      placeholder: "+880…",
      required: false,
      order: 2,
    },
  ];
}

function slugify(title: string, unique = false): string {
  const base =
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 100) || "event";
  return unique ? `${base}-${Date.now().toString(36)}` : base;
}

function toIsoLocal(value: string): string {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function toDatetimeLocal(value?: string | Date): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

function defaultRegistrationWindow(eventStart: Date): { open: Date; close: Date } {
  const open = new Date();
  const close = new Date(eventStart);
  close.setHours(close.getHours() - 1);
  if (close <= open) close.setTime(eventStart.getTime());
  return { open, close };
}

function deriveRegistrationFromSegments(segments: TicketSegment[]): {
  start: string;
  end: string;
} {
  const starts = segments.map((s) => s.saleStart).filter(Boolean) as string[];
  const ends = segments.map((s) => s.saleEnd).filter(Boolean) as string[];
  return {
    start: starts.length ? starts.sort()[0]! : "",
    end: ends.length ? ends.sort().reverse()[0]! : "",
  };
}

const DESCRIPTION_MIN_LENGTH = 10;
const DESCRIPTION_PLACEHOLDER =
  "Event description will be added by the organizer.";

/** Backend requires description min 10 chars; use placeholder for empty/short drafts on create. */
export function normalizeDescription(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= DESCRIPTION_MIN_LENGTH) return trimmed;
  return DESCRIPTION_PLACEHOLDER;
}

export function isDescriptionReadyForPublish(value: string): boolean {
  return value.trim().length >= DESCRIPTION_MIN_LENGTH;
}

export function apiFieldToBuilder(f: DynamicFormField, index: number): FormField {
  return {
    fieldId: f.key || `field_${index}`,
    type: f.type as FieldType,
    label: f.label,
    placeholder: f.placeholder,
    helperText: f.helperText,
    required: f.required,
    hidden: f.hidden,
    readonly: f.readonly,
    options: f.options,
    order: f.order ?? index,
  };
}

export function builderFieldToApi(f: FormField, index: number): DynamicFormField {
  const key =
    f.fieldId === "field_full_name"
      ? "full_name"
      : f.fieldId === "field_email"
        ? "email"
        : f.fieldId === "field_phone"
          ? "phone"
          : f.fieldId.replace(/^field_/, "") || `field_${index}`;
  return {
    key,
    label: f.label,
    type: String(f.type),
    required: f.required,
    placeholder: f.placeholder,
    helperText: f.helperText,
    options: f.options,
    order: f.order ?? index,
    hidden: f.hidden,
    readonly: f.readonly,
  };
}

export function apiSegmentToBuilder(s: ApiSegment, index: number): TicketSegment {
  const id = s._id ?? `seg_${index}`;
  const sold = s.quantitySold ?? 0;
  return {
    segmentId: id,
    name: s.title,
    description: s.description,
    price: s.price,
    isFree: s.isFree ?? s.price === 0,
    capacity: s.capacity,
    remainingQuantity: Math.max(0, s.capacity - sold),
    maxPurchasePerUser: s.maxPurchase ?? 10,
    minPurchase: s.minPurchase ?? 1,
    saleStart: toDatetimeLocal(s.saleStart),
    saleEnd: toDatetimeLocal(s.saleEnd),
    visibility: s.isVisible === false ? "hidden" : "public",
    ticketColor: s.ticketColor ?? "#9B5CFF",
    status: s.status ?? "active",
    formFields: (s.formFields ?? []).map(apiFieldToBuilder),
  };
}

export function builderSegmentToApi(s: TicketSegment): ApiSegment {
  const section: ApiSegment = {
    title: s.name,
    description: s.description,
    price: s.isFree ? 0 : s.price,
    isFree: s.isFree,
    capacity: s.capacity,
    quantitySold: Math.max(0, s.capacity - s.remainingQuantity),
    maxPurchase: s.maxPurchasePerUser,
    minPurchase: s.minPurchase,
    benefits: [],
    isVisible: s.visibility !== "hidden",
    saleStart: s.saleStart ? toIsoLocal(s.saleStart) : undefined,
    saleEnd: s.saleEnd ? toIsoLocal(s.saleEnd) : undefined,
    status: s.status,
    ticketColor: s.ticketColor,
    formEnabled: s.formFields.length > 0,
    formFields: s.formFields.map(builderFieldToApi),
  };
  if (isMongoObjectId(s.segmentId)) {
    section._id = s.segmentId;
  }
  return section;
}

export function eventToWizardState(event: EventDetail): EventWizardState {
  const tags = event.tags?.join(", ") ?? "";
  const streamInMap = event.venue?.mapUrl?.startsWith("http") ? event.venue.mapUrl : "";
  const format: EventWizardState["eventFormat"] =
    tags.includes("format:online") ? "online" : tags.includes("format:hybrid") ? "hybrid" : "in-person";

  return {
    eventId: event._id,
    title: event.title,
    category: event.category,
    shortDescription: event.shortDescription ?? "",
    description: event.description ?? "",
    eventFormat: format,
    startDate: toDatetimeLocal(event.startDate) || "",
    endDate: toDatetimeLocal(event.endDate) || "",
    registrationStart:
      toDatetimeLocal(event.registrationStart) ||
      deriveRegistrationFromSegments(
        (event.ticketSections ?? []).map((s, i) => apiSegmentToBuilder(s, i))
      ).start,
    registrationEnd:
      toDatetimeLocal(event.registrationEnd) ||
      deriveRegistrationFromSegments(
        (event.ticketSections ?? []).map((s, i) => apiSegmentToBuilder(s, i))
      ).end,
    tags: tags.replace(/format:\w+,?\s*/g, "").trim(),
    coverImage: resolveUploadUrl(event.coverImage ?? "") || "",
    venueName: event.venue?.name ?? "",
    venueAddress: event.venue?.address ?? "",
    venueCity: event.venue?.city ?? "Dhaka",
    mapUrl: format === "online" ? "" : (event.venue?.mapUrl ?? ""),
    onlinePlatform: "Zoom",
    streamUrl: streamInMap,
    segments: (event.ticketSections ?? []).map((s, i) => {
      const seg = apiSegmentToBuilder(s, i);
      const regStart =
        toDatetimeLocal(event.registrationStart) ||
        deriveRegistrationFromSegments([seg]).start;
      const regEnd =
        toDatetimeLocal(event.registrationEnd) ||
        deriveRegistrationFromSegments([seg]).end;
      return stripInheritedSegmentSaleTimes(seg, regStart, regEnd);
    }),
    globalFormFields:
      event.customForm?.fields?.length
        ? event.customForm.fields.map(apiFieldToBuilder)
        : defaultGlobalFormFields(),
    completedSteps: [1, 2, 3, 4, 5],
  };
}

export function createInitialWizardState(): EventWizardState {
  const start = new Date();
  start.setDate(start.getDate() + 14);
  const end = new Date(start);
  end.setHours(end.getHours() + 4);
  const { open: regOpen, close: regClose } = defaultRegistrationWindow(start);

  return {
    title: "",
    category: "Concert",
    shortDescription: "",
    description: "",
    eventFormat: "in-person",
    startDate: toDatetimeLocal(start),
    endDate: toDatetimeLocal(end),
    registrationStart: toDatetimeLocal(regOpen),
    registrationEnd: toDatetimeLocal(regClose),
    tags: "",
    coverImage: "",
    venueName: "",
    venueAddress: "",
    venueCity: "Dhaka",
    mapUrl: "",
    onlinePlatform: "Zoom",
    streamUrl: "",
    segments: [],
    globalFormFields: defaultGlobalFormFields(),
    completedSteps: [],
  };
}

function buildTags(state: EventWizardState): string[] {
  const manual = state.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return [...manual, `format:${state.eventFormat}`];
}

function optionalHttpUrl(url?: string): string | undefined {
  const trimmed = url?.trim();
  return trimmed && /^https?:\/\//i.test(trimmed) ? trimmed : undefined;
}

function buildVenue(state: EventWizardState) {
  if (state.eventFormat === "online") {
    return {
      name: state.onlinePlatform || "Online",
      address: state.streamUrl || "Online event",
      city: state.venueCity || "Dhaka",
      country: "Bangladesh",
      mapUrl: optionalHttpUrl(state.streamUrl),
    };
  }
  return {
    name: state.venueName || "TBA",
    address: state.venueAddress || undefined,
    city: state.venueCity || "Dhaka",
    country: "Bangladesh",
    mapUrl: optionalHttpUrl(state.mapUrl) ?? optionalHttpUrl(state.streamUrl),
  };
}

function isMongoObjectId(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}

function buildTicketSectionsForPayload(state: EventWizardState): ReturnType<typeof builderSegmentToApi>[] {
  const regStart = state.registrationStart ? toIsoLocal(state.registrationStart) : undefined;
  const regEnd = state.registrationEnd ? toIsoLocal(state.registrationEnd) : undefined;

  const sections =
    state.segments.length > 0
      ? state.segments.map(builderSegmentToApi)
      : [
          {
            title: "General Admission",
            price: 0,
            isFree: true,
            capacity: 100,
            maxPurchase: 10,
            minPurchase: 1,
            benefits: [],
            isVisible: true,
            status: "active" as const,
            formEnabled: false,
            formFields: [],
          },
        ];

  return sections.map((seg) => ({
    ...seg,
    saleStart: seg.saleStart ? toIsoLocal(seg.saleStart) : regStart,
    saleEnd: seg.saleEnd ? toIsoLocal(seg.saleEnd) : regEnd,
  }));
}

/** Minimal payload for first create (passes backend validation). */
export function buildCreatePayload(state: EventWizardState): Record<string, unknown> {
  const segments = buildTicketSectionsForPayload(state);
  const capacity = segments.reduce((sum, s) => sum + s.capacity, 0);

  return {
    title: state.title.trim() || "Untitled event",
    slug: slugify(state.title || "draft", true),
    shortDescription: state.shortDescription.trim() || "Draft event — details coming soon.",
    description: normalizeDescription(state.description),
    category: state.category,
    tags: buildTags(state),
    coverImage: state.coverImage
      ? resolveUploadUrl(state.coverImage) || toAbsoluteUploadUrl(state.coverImage)
      : undefined,
    venue: buildVenue(state),
    startDate: toIsoLocal(state.startDate),
    endDate: toIsoLocal(state.endDate),
    registrationStart: state.registrationStart ? toIsoLocal(state.registrationStart) : undefined,
    registrationEnd: state.registrationEnd ? toIsoLocal(state.registrationEnd) : undefined,
    ticketSections: segments,
    capacity: Math.max(capacity, 1),
    customForm: {
      enabled: state.globalFormFields.length > 0,
      fields: state.globalFormFields.map(builderFieldToApi),
    },
  };
}

export function buildUpdatePayload(state: EventWizardState): Record<string, unknown> {
  const { slug: _slug, description: _ignored, ...payload } = buildCreatePayload(state);
  const trimmed = state.description.trim();
  if (trimmed.length >= DESCRIPTION_MIN_LENGTH) {
    payload.description = trimmed;
  } else if (trimmed.length === 0) {
    payload.description = DESCRIPTION_PLACEHOLDER;
  }
  // 1–9 chars: omit description so draft saves do not fail validation
  return payload;
}

/** Full replacement payload for admin edits (live/ended events included). */
export function buildAdminUpdatePayload(state: EventWizardState): Record<string, unknown> {
  const { slug: _slug, description: _ignored, ...payload } = buildCreatePayload(state);
  const trimmed = state.description.trim();
  payload.description =
    trimmed.length >= DESCRIPTION_MIN_LENGTH
      ? trimmed
      : trimmed.length > 0
        ? trimmed
        : DESCRIPTION_PLACEHOLDER;
  // Omit slug on update — buildCreatePayload generates a new unique slug each time,
  // which would break public /event/[slug] URLs after every admin save.
  return payload;
}

export function validateForPublish(state: EventWizardState, isAdmin = false): string[] {
  const errors: string[] = [];
  if (!state.title.trim()) errors.push("Event title is required");
  if (!state.startDate) errors.push("Event start date is required");
  if (!state.endDate) errors.push("Event end date is required");
  if (!state.registrationStart) errors.push("Registration open date is required");
  if (!state.registrationEnd) errors.push("Registration close date is required");
  if (
    state.registrationStart &&
    state.registrationEnd &&
    state.registrationEnd <= state.registrationStart
  ) {
    errors.push("Registration close must be after registration open");
  }
  if (state.registrationEnd && state.endDate && state.registrationEnd > state.endDate) {
    errors.push("Registration cannot close after the event ends");
  }
  if (!isDescriptionReadyForPublish(state.description) && !isAdmin) {
    errors.push("Full description must be at least 10 characters");
  }
  if (isAdmin && !state.description.trim()) {
    errors.push("Description is required");
  }
  if (!state.coverImage && !isAdmin) errors.push("Banner image is required");
  if (state.segments.length === 0) errors.push("At least one ticket segment is required");
  return errors;
}

export function publishWarnings(state: EventWizardState): string[] {
  const warnings: string[] = [];
  if (state.eventFormat !== "online" && !state.venueName.trim()) {
    warnings.push("No venue name added");
  }
  if (!state.description.trim()) warnings.push("No full description");
  return warnings;
}
