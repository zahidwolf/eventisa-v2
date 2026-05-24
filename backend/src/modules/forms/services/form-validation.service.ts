import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import {
  FormFieldType,
  type IFormField,
  type IFormResponse,
} from "@/modules/forms/types/form-field.types.js";
import { getVisibleFieldKeys } from "@/modules/forms/services/conditional-form.util.js";

function asString(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(",");
  return String(v);
}

function validateField(field: IFormField, raw: unknown): void {
  const val = raw;
  const str = asString(val);

  if (field.required && (val === undefined || val === null || str === "")) {
    throw new AppError(`${field.label} is required`, 400, ErrorCodes.VALIDATION_ERROR);
  }

  if (str === "" && !field.required) return;

  const v = field.validation;
  if (v?.minLength != null && str.length < v.minLength) {
    throw new AppError(`${field.label} is too short`, 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (v?.maxLength != null && str.length > v.maxLength) {
    throw new AppError(`${field.label} is too long`, 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (v?.pattern) {
    const re = new RegExp(v.pattern);
    if (!re.test(str)) {
      throw new AppError(v.patternMessage ?? `${field.label} is invalid`, 400, ErrorCodes.VALIDATION_ERROR);
    }
  }

  if (field.type === FormFieldType.Email && str && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
    throw new AppError(`Invalid email for ${field.label}`, 400, ErrorCodes.VALIDATION_ERROR);
  }

  if (field.type === FormFieldType.Number && str) {
    const n = Number(str);
    if (Number.isNaN(n)) {
      throw new AppError(`${field.label} must be a number`, 400, ErrorCodes.VALIDATION_ERROR);
    }
    if (v?.min != null && n < v.min) {
      throw new AppError(`${field.label} below minimum`, 400, ErrorCodes.VALIDATION_ERROR);
    }
    if (v?.max != null && n > v.max) {
      throw new AppError(`${field.label} above maximum`, 400, ErrorCodes.VALIDATION_ERROR);
    }
  }
}

export function validateFormResponses(
  fields: IFormField[],
  responses: IFormResponse[],
  options?: { enabled?: boolean }
) {
  if (options?.enabled === false) return;
  if (!fields.length) return;

  const valueMap: Record<string, unknown> = {};
  for (const r of responses) {
    valueMap[r.fieldKey] = r.value;
  }

  const visible = getVisibleFieldKeys(fields, valueMap as Record<string, string | string[] | boolean | number>);

  for (const field of fields) {
    if (!visible.has(field.key)) continue;
    validateField(field, valueMap[field.key]);
  }

  const allowed = new Set(fields.map((f) => f.key));
  for (const r of responses) {
    if (!allowed.has(r.fieldKey)) {
      throw new AppError(`Unknown field: ${r.fieldKey}`, 400, ErrorCodes.VALIDATION_ERROR);
    }
  }
}

export function resolveSegmentFormFields(
  section: { formFields?: IFormField[]; formEnabled?: boolean },
  eventForm?: { enabled?: boolean; fields?: IFormField[] }
): { enabled: boolean; fields: IFormField[] } {
  if (section.formFields?.length) {
    return { enabled: section.formEnabled !== false, fields: section.formFields };
  }
  return {
    enabled: !!eventForm?.enabled,
    fields: eventForm?.fields ?? [],
  };
}
