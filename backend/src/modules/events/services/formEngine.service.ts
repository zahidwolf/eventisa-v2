import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { Event } from "@/modules/events/models/event.model.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import type { IFormField } from "@/modules/forms/types/form-field.types.js";
import {
  fromApiField,
  sectionDocId,
  toApiField,
} from "@/modules/events/utils/event-builder.mapper.js";
import {
  getVisibleFieldKeys,
  resolveVisibleFields,
  type FormAnswers,
} from "@/modules/events/utils/conditional-logic.util.js";
import type { IBuilderFormField } from "@/modules/events/models/formField.model.js";
import { validateField } from "@/modules/events/services/formEngine.validation.js";

async function loadEventForOrganizer(eventId: string, userId: string) {
  const organizer = await Organizer.findOne({ userId });
  if (!organizer) throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);
  const event = await Event.findOne({ _id: eventId, organizer: organizer._id });
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);
  return event;
}

function getGlobalFields(event: Awaited<ReturnType<typeof loadEventForOrganizer>>) {
  return event.customForm?.fields ?? [];
}

function setGlobalFields(
  event: Awaited<ReturnType<typeof loadEventForOrganizer>>,
  fields: IFormField[]
) {
  event.customForm.enabled = fields.length > 0;
  event.customForm.fields = fields;
  event.markModified("customForm");
}

function getSegmentFields(
  event: Awaited<ReturnType<typeof loadEventForOrganizer>>,
  segmentId: string
) {
  const idx = event.ticketSections.findIndex((s) => sectionDocId(s) === segmentId);
  if (idx < 0) throw new AppError("Segment not found", 404, ErrorCodes.NOT_FOUND);
  return { idx, fields: event.ticketSections[idx].formFields ?? [] };
}

export async function addField(
  eventId: string,
  userId: string,
  segmentId: string | null,
  fieldData: Partial<IBuilderFormField>
) {
  try {
    const event = await loadEventForOrganizer(eventId, userId);
    const field = fromApiField(fieldData);
    const maxOrder = segmentId
      ? Math.max(0, ...getSegmentFields(event, segmentId).fields.map((f) => f.order ?? 0))
      : Math.max(0, ...getGlobalFields(event).map((f) => f.order ?? 0));
    field.order = fieldData.order ?? maxOrder + 1;

    if (segmentId) {
      const { idx, fields } = getSegmentFields(event, segmentId);
      fields.push(field);
      event.ticketSections[idx].formFields = fields;
      event.ticketSections[idx].formEnabled = true;
      event.markModified("ticketSections");
    } else {
      const fields = [...getGlobalFields(event), field];
      setGlobalFields(event, fields);
    }
    await event.save();
    return toApiField(field);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to add form field", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function updateField(
  eventId: string,
  userId: string,
  segmentId: string | null,
  fieldId: string,
  updates: Partial<IBuilderFormField>
) {
  try {
    const event = await loadEventForOrganizer(eventId, userId);
    const fields = segmentId
      ? getSegmentFields(event, segmentId).fields
      : getGlobalFields(event);
    const idx = fields.findIndex((f) => (f.fieldId ?? f.key) === fieldId || f.key === fieldId);
    if (idx < 0) throw new AppError("Field not found", 404, ErrorCodes.NOT_FOUND);

    const merged = fromApiField({ ...toApiField(fields[idx]), ...updates, fieldId });
    fields[idx] = merged;

    if (segmentId) {
      const segIdx = getSegmentFields(event, segmentId).idx;
      event.ticketSections[segIdx].formFields = fields;
      event.markModified("ticketSections");
    } else {
      setGlobalFields(event, fields);
    }
    await event.save();
    return toApiField(fields[idx]);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to update form field", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function deleteField(
  eventId: string,
  userId: string,
  segmentId: string | null,
  fieldId: string
) {
  try {
    const event = await loadEventForOrganizer(eventId, userId);
    if (segmentId) {
      const { idx, fields } = getSegmentFields(event, segmentId);
      const next = fields.filter((f) => (f.fieldId ?? f.key) !== fieldId && f.key !== fieldId);
      if (next.length === fields.length) throw new AppError("Field not found", 404, ErrorCodes.NOT_FOUND);
      event.ticketSections[idx].formFields = next;
      event.markModified("ticketSections");
    } else {
      const next = getGlobalFields(event).filter(
        (f) => (f.fieldId ?? f.key) !== fieldId && f.key !== fieldId
      );
      if (next.length === getGlobalFields(event).length) {
        throw new AppError("Field not found", 404, ErrorCodes.NOT_FOUND);
      }
      setGlobalFields(event, next);
    }
    await event.save();
    return { deleted: true };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to delete form field", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function reorderFields(
  eventId: string,
  userId: string,
  segmentId: string | null,
  orderedFieldIds: string[]
) {
  try {
    const event = await loadEventForOrganizer(eventId, userId);
    const source = segmentId
      ? getSegmentFields(event, segmentId).fields
      : getGlobalFields(event);
    const map = new Map(source.map((f) => [(f.fieldId ?? f.key) as string, f]));
    const reordered = orderedFieldIds.map((id, order) => {
      const f = map.get(id);
      if (!f) throw new AppError(`Unknown field: ${id}`, 400, ErrorCodes.VALIDATION_ERROR);
      return { ...f, order };
    });
    if (reordered.length !== source.length) {
      throw new AppError("orderedFieldIds must include all fields", 400, ErrorCodes.VALIDATION_ERROR);
    }

    if (segmentId) {
      const { idx } = getSegmentFields(event, segmentId);
      event.ticketSections[idx].formFields = reordered;
      event.markModified("ticketSections");
    } else {
      setGlobalFields(event, reordered);
    }
    await event.save();
    return reordered.map(toApiField);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to reorder fields", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function listFields(eventId: string, userId: string, segmentId: string | null) {
  try {
    const event = await loadEventForOrganizer(eventId, userId);
    const fields = segmentId
      ? getSegmentFields(event, segmentId).fields
      : getGlobalFields(event);
    return fields.map(toApiField).sort((a, b) => a.order - b.order);
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Failed to list form fields", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function validateSubmission(
  fields: IFormField[],
  answers: FormAnswers
) {
  try {
    const resolved = resolveVisibleFields(fields, answers);
    const visibleKeys = getVisibleFieldKeys(fields, answers);

    for (const field of resolved) {
      if (!visibleKeys.has(field.key)) continue;
      validateField(field, answers[field.key]);
    }

    for (const key of Object.keys(answers)) {
      if (!fields.some((f) => f.key === key || (f as { fieldId?: string }).fieldId === key)) {
        throw new AppError(`Unknown field: ${key}`, 400, ErrorCodes.VALIDATION_ERROR);
      }
    }

    return { valid: true, fields: resolved.filter((f) => !f.hidden).map(toApiField) };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Form validation failed", 500, ErrorCodes.INTERNAL_ERROR);
  }
}

export async function validateEventSubmission(
  eventId: string,
  segmentId: string | null,
  answers: FormAnswers
) {
  const event = await Event.findById(eventId);
  if (!event) throw new AppError("Event not found", 404, ErrorCodes.NOT_FOUND);

  let fields: IFormField[] = getGlobalFields(event);
  if (segmentId) {
    const section = event.ticketSections.find((s) => sectionDocId(s) === segmentId);
    if (!section) throw new AppError("Segment not found", 404, ErrorCodes.NOT_FOUND);
    if (section.formFields?.length) fields = section.formFields;
  }

  return validateSubmission(fields, answers);
}
