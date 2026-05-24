import type { EventDocument } from "@/modules/events/models/event.model.js";
import type { ITicketSection } from "@/modules/events/models/ticket-section.schema.js";
import type { IFormField } from "@/modules/forms/types/form-field.types.js";
import { resolveSegmentFormFields } from "@/modules/forms/services/form-validation.service.js";
import { sectionDocId } from "@/modules/events/utils/event-builder.mapper.js";

export interface AttendeeSubmissionRow {
  id: string;
  orderId: string;
  segmentId: string;
  segmentName: string;
  segmentColor?: string;
  name: string;
  email: string;
  phone?: string;
  answers: Record<string, unknown>;
  submittedAt: Date;
}

export interface FormFieldLabel {
  key: string;
  label: string;
}

type SectionDoc = ITicketSection & { _id?: { toString(): string } };

const NAME_KEYS = ["name", "full_name", "fullname", "guest_name", "guestName"];
const EMAIL_KEYS = ["email", "e-mail", "guest_email", "guestEmail"];
const PHONE_KEYS = ["phone", "mobile", "guest_phone", "guestPhone"];

const TABLE_COLUMN_EXCLUDE = new Set([
  ...NAME_KEYS,
  ...EMAIL_KEYS,
  ...PHONE_KEYS,
  "orderid",
  "order_id",
]);

function pickAnswer(answers: Record<string, unknown>, keys: string[]): string {
  const lower = Object.fromEntries(
    Object.entries(answers).map(([k, v]) => [k.toLowerCase(), v])
  );
  for (const key of keys) {
    const val = lower[key];
    if (val != null && String(val).trim()) return String(val);
  }
  for (const [k, v] of Object.entries(answers)) {
    if (keys.some((key) => k.toLowerCase().includes(key)) && v != null) {
      return String(v);
    }
  }
  return "";
}

/** All known IDs for a ticket section (_id, segmentId, canonical). */
export function sectionIdAliases(section: SectionDoc): string[] {
  const ids = new Set<string>();
  const mongoId = section._id?.toString();
  if (mongoId) ids.add(mongoId);
  if (section.segmentId) ids.add(section.segmentId);
  const canonical = sectionDocId(section);
  if (canonical) ids.add(canonical);
  return [...ids];
}

export function findSectionBySegmentRef(
  event: EventDocument,
  segmentRef: string
): SectionDoc | undefined {
  const sections = event.ticketSections as SectionDoc[];
  return (
    sections.find((s) => s._id?.toString() === segmentRef) ??
    sections.find((s) => s.segmentId === segmentRef) ??
    sections.find((s) => sectionDocId(s) === segmentRef)
  );
}

export function segmentMeta(event: EventDocument, segmentRef: string) {
  const section = findSectionBySegmentRef(event, segmentRef);
  return {
    segmentId: section ? sectionDocId(section) : segmentRef,
    name: section?.name ?? section?.title ?? "Unknown segment",
    color: section?.ticketColor,
  };
}

export function segmentIdsMatchingFilter(
  event: EventDocument,
  filterSegmentId: string
): string[] {
  const section = findSectionBySegmentRef(event, filterSegmentId);
  return section ? sectionIdAliases(section) : [filterSegmentId];
}

function answerHasValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function filledAnswerKeys(answers: Record<string, unknown>): Set<string> {
  const keys = new Set<string>();
  for (const [key, value] of Object.entries(answers)) {
    if (!answerHasValue(value)) continue;
    keys.add(key);
    keys.add(key.toLowerCase());
  }
  return keys;
}

function segmentFormConfig(event: EventDocument, segmentRef: string) {
  const section = findSectionBySegmentRef(event, segmentRef);
  if (!section) {
    return { enabled: !!event.customForm?.enabled, fields: event.customForm?.fields ?? [] };
  }
  return resolveSegmentFormFields(section, event.customForm);
}

function appendRequiredFilledFields(
  formFields: IFormField[],
  filledKeys: Set<string>,
  out: FormFieldLabel[],
  seen: Set<string>
) {
  const sorted = [...formFields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const field of sorted) {
    if (field.hidden || !field.required) continue;
    const key = field.key.trim();
    if (!key || TABLE_COLUMN_EXCLUDE.has(key.toLowerCase()) || seen.has(key)) continue;
    if (!filledKeys.has(key) && !filledKeys.has(key.toLowerCase())) continue;
    seen.add(key);
    out.push({ key, label: field.label.trim() || key });
  }
}

/**
 * Table columns: required fields for the segment form that attendees actually filled.
 * Name, email, and phone stay in fixed columns.
 */
export function collectFormFieldLabels(
  event: EventDocument,
  options?: {
    segmentFilterId?: string;
    rows?: Pick<AttendeeSubmissionRow, "segmentId" | "answers">[];
  }
): FormFieldLabel[] {
  const result: FormFieldLabel[] = [];
  const seen = new Set<string>();

  if (options?.segmentFilterId) {
    const config = segmentFormConfig(event, options.segmentFilterId);
    const filled = options.rows?.length
      ? options.rows.reduce((acc, row) => {
          for (const k of filledAnswerKeys(row.answers)) acc.add(k);
          return acc;
        }, new Set<string>())
      : new Set<string>();
    appendRequiredFilledFields(config.fields, filled, result, seen);
    return result;
  }

  if (options?.rows?.length) {
    for (const row of options.rows) {
      const config = segmentFormConfig(event, row.segmentId);
      appendRequiredFilledFields(config.fields, filledAnswerKeys(row.answers), result, seen);
    }
    return result;
  }

  return result;
}

export function collectFormFieldLabelsForSubmission(
  event: EventDocument,
  row: Pick<AttendeeSubmissionRow, "segmentId" | "answers">
): FormFieldLabel[] {
  return collectFormFieldLabels(event, {
    segmentFilterId: row.segmentId,
    rows: [row],
  });
}

export function formFieldsForTable(columns: FormFieldLabel[]): FormFieldLabel[] {
  return columns.filter((f) => !TABLE_COLUMN_EXCLUDE.has(f.key.toLowerCase()));
}

export function toAttendeeRow(
  event: EventDocument,
  raw: {
    _id: { toString(): string };
    orderId: string;
    segmentId: string;
    answers?: Record<string, unknown>;
    submittedAt: Date;
  },
  orderFallback?: { guestName?: string; guestEmail?: string; guestPhone?: string }
): AttendeeSubmissionRow {
  const answers = (raw.answers ?? {}) as Record<string, unknown>;
  const meta = segmentMeta(event, raw.segmentId);
  const name =
    pickAnswer(answers, NAME_KEYS) ||
    orderFallback?.guestName?.trim() ||
    "";
  const email =
    pickAnswer(answers, EMAIL_KEYS) ||
    orderFallback?.guestEmail?.trim() ||
    "";
  const phone =
    pickAnswer(answers, PHONE_KEYS) || orderFallback?.guestPhone?.trim() || undefined;
  return {
    id: raw._id.toString(),
    orderId: raw.orderId,
    segmentId: meta.segmentId,
    segmentName: meta.name,
    segmentColor: meta.color,
    name: name || "—",
    email: email || "—",
    phone: phone || undefined,
    answers,
    submittedAt: raw.submittedAt,
  };
}

export function matchesSearch(row: AttendeeSubmissionRow, query: string): boolean {
  const q = query.toLowerCase();
  const blob = [
    row.orderId,
    row.name,
    row.email,
    row.phone ?? "",
    row.segmentName,
    JSON.stringify(row.answers),
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes(q);
}
