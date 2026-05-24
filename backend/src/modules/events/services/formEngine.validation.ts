import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import { FormFieldType, type IFormField } from "@/modules/forms/types/form-field.types.js";

function asString(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(",");
  return String(v);
}

export function validateField(field: IFormField, raw: unknown): void {
  const str = asString(raw);
  const v = field.validation as
    | {
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: string;
        patternMessage?: string;
        regex?: string;
        regexMessage?: string;
        allowedFileTypes?: string[];
        maxFileSizeMB?: number;
      }
    | undefined;

  if (field.required && (raw === undefined || raw === null || str === "")) {
    throw new AppError(`${field.label} is required`, 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (str === "" && !field.required) return;

  if (v?.minLength != null && str.length < v.minLength) {
    throw new AppError(`${field.label} is too short`, 400, ErrorCodes.VALIDATION_ERROR);
  }
  if (v?.maxLength != null && str.length > v.maxLength) {
    throw new AppError(`${field.label} is too long`, 400, ErrorCodes.VALIDATION_ERROR);
  }

  const pattern = v?.regex ?? v?.pattern;
  if (pattern) {
    const re = new RegExp(pattern);
    if (!re.test(str)) {
      throw new AppError(v?.regexMessage ?? v?.patternMessage ?? `${field.label} is invalid`, 400, ErrorCodes.VALIDATION_ERROR);
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
