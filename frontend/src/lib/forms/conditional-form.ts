import type { DynamicFormField } from "@/lib/forms/form-field-types";
import {
  getVisibleFields as resolveVisible,
  resolveVisibleFields,
} from "@/lib/forms/resolve-visible-fields";
import type { FormField } from "@/types/eventBuilder.types";

export type FormValues = Record<string, string | string[] | boolean | number>;

function toBuilderField(f: DynamicFormField): FormField {
  return {
    fieldId: f.key,
    type: f.type,
    label: f.label,
    required: f.required,
    placeholder: f.placeholder,
    helperText: f.helperText,
    defaultValue: f.defaultValue,
    options: f.options,
    order: f.order,
    hidden: f.hidden,
    readonly: f.readonly,
    validation: f.validation
      ? {
          min: f.validation.min,
          max: f.validation.max,
          minLength: f.validation.minLength,
          maxLength: f.validation.maxLength,
          regex: f.validation.pattern,
          regexMessage: f.validation.patternMessage,
        }
      : undefined,
    conditionalLogic: f.showWhen
      ? {
          dependsOn: f.showWhen.fieldKey,
          operator: f.showWhen.operator,
          value: f.showWhen.value,
          action: "show",
        }
      : undefined,
  };
}

/** Legacy helper — uses Phase 8 resolveVisibleFields under the hood. */
export function getVisibleFields(fields: DynamicFormField[], values: FormValues): DynamicFormField[] {
  const resolved = resolveVisible(fields.map(toBuilderField), values);
  const byId = new Map(resolved.map((f) => [f.fieldId, f]));
  return fields
    .filter((f) => {
      const r = byId.get(f.key);
      return r && !r.hidden;
    })
    .sort((a, b) => a.order - b.order);
}

export { resolveVisibleFields };
