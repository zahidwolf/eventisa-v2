import type mongoose from "mongoose";
import { AttendeeSubmission } from "@/modules/events/models/attendeeSubmission.model.js";
import type { EventDocument } from "@/modules/events/models/event.model.js";
import { findSectionBySegmentRef } from "@/modules/events/utils/attendee-row.util.js";
import { Order } from "@/modules/orders/models/order.model.js";
import { resolveSegmentFormFields } from "@/modules/forms/services/form-validation.service.js";
import { FormFieldType } from "@/modules/forms/types/form-field.types.js";

export interface CheckInFormAnswer {
  label: string;
  value: string;
  fieldType: string;
}

function answerHasValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return true;
  return true;
}

function formatAnswerValue(fieldType: string, value: unknown): string {
  if (!answerHasValue(value)) return "";
  if (fieldType === FormFieldType.File || fieldType === FormFieldType.Image) {
    return "File submitted";
  }
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value).trim();
}

function pickAnswer(answers: Record<string, unknown>, key: string): unknown {
  if (key in answers) return answers[key];
  const lower = key.toLowerCase();
  for (const [k, v] of Object.entries(answers)) {
    if (k.toLowerCase() === lower) return v;
  }
  return undefined;
}

export async function buildCheckInFormAnswers(
  event: EventDocument,
  ticket: {
    sectionId: string;
    orderId: mongoose.Types.ObjectId;
    holderName?: string;
    holderEmail?: string;
    holderPhone?: string;
  }
): Promise<CheckInFormAnswer[]> {
  const order = await Order.findById(ticket.orderId).lean();
  if (!order) return [];

  let answers: Record<string, unknown> = {};
  const submission = await AttendeeSubmission.findOne({
    eventId: event._id,
    orderId: order.orderId,
  }).lean();

  if (submission?.answers && typeof submission.answers === "object") {
    answers = { ...(submission.answers as Record<string, unknown>) };
  } else if (order.customFormResponses?.length) {
    answers = Object.fromEntries(
      order.customFormResponses.map((r) => [r.fieldKey, r.value])
    );
  }

  const section = findSectionBySegmentRef(event, ticket.sectionId);
  const { fields } = resolveSegmentFormFields(section ?? {}, event.customForm);
  const sorted = [...fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const result: CheckInFormAnswer[] = [];
  const seenKeys = new Set<string>();

  for (const field of sorted) {
    const key = field.key.trim();
    if (!key) continue;
    const raw = pickAnswer(answers, key);
    const value = formatAnswerValue(field.type, raw);
    if (!value) continue;
    seenKeys.add(key.toLowerCase());
    result.push({
      label: field.label.trim() || key,
      value,
      fieldType: field.type,
    });
  }

  for (const [key, raw] of Object.entries(answers)) {
    if (seenKeys.has(key.toLowerCase())) continue;
    const value = formatAnswerValue(FormFieldType.Text, raw);
    if (!value) continue;
    result.push({ label: key, value, fieldType: FormFieldType.Text });
  }

  const guestExtras: CheckInFormAnswer[] = [];
  const guests: CheckInFormAnswer[] = [
    { label: "Full Name", value: order.guestName?.trim() ?? ticket.holderName?.trim() ?? "", fieldType: FormFieldType.Text },
    { label: "Email", value: order.guestEmail?.trim() ?? ticket.holderEmail?.trim() ?? "", fieldType: FormFieldType.Email },
    { label: "Phone", value: order.guestPhone?.trim() ?? ticket.holderPhone?.trim() ?? "", fieldType: FormFieldType.Phone },
  ];
  for (const g of guests) {
    if (!g.value) continue;
    const dup = result.some(
      (r) =>
        r.label.toLowerCase() === g.label.toLowerCase() ||
        r.value.toLowerCase() === g.value.toLowerCase()
    );
    if (!dup) guestExtras.push(g);
  }

  return [...guestExtras, ...result];
}
