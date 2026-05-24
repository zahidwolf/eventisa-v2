import {
  ConditionalAction,
  ConditionalOperator,
  type IConditionalLogic,
} from "@/modules/events/models/formField.model.js";
import type { IFormField, FormFieldCondition } from "@/modules/forms/types/form-field.types.js";

export type FormAnswers = Record<string, string | string[] | boolean | number | undefined>;

export interface ResolvedFormField {
  fieldId: string;
  key: string;
  label: string;
  required: boolean;
  hidden: boolean;
  [key: string]: unknown;
}

function getDependsOn(logic?: IConditionalLogic | FormFieldCondition): string | undefined {
  if (!logic) return undefined;
  if ("dependsOn" in logic && logic.dependsOn) return logic.dependsOn;
  if ("fieldKey" in logic && logic.fieldKey) return logic.fieldKey;
  return undefined;
}

function getAction(logic?: IConditionalLogic | FormFieldCondition): ConditionalAction | "show" {
  if (!logic) return ConditionalAction.Show;
  if ("action" in logic && logic.action) return logic.action as ConditionalAction;
  return ConditionalAction.Show;
}

export function evaluateConditional(
  logic: IConditionalLogic | FormFieldCondition | undefined,
  answers: FormAnswers
): boolean {
  if (!logic) return true;

  const dependsOn = getDependsOn(logic);
  if (!dependsOn) return true;

  const current = answers[dependsOn];
  const target = "value" in logic ? logic.value : undefined;
  const op = logic.operator ?? ConditionalOperator.Equals;

  switch (op) {
    case ConditionalOperator.Equals:
    case "equals":
      return String(current ?? "") === String(target ?? "");
    case ConditionalOperator.NotEquals:
    case "not_equals":
      return String(current ?? "") !== String(target ?? "");
    case ConditionalOperator.Contains:
    case "contains":
      return String(current ?? "").toLowerCase().includes(String(target ?? "").toLowerCase());
    case ConditionalOperator.NotContains:
    case "not_contains":
      return !String(current ?? "").toLowerCase().includes(String(target ?? "").toLowerCase());
    case ConditionalOperator.GreaterThan:
    case "greater_than":
      return Number(current) > Number(target);
    case ConditionalOperator.LessThan:
    case "less_than":
      return Number(current) < Number(target);
    case ConditionalOperator.Checked:
    case "checked":
      return current === true || current === "true";
    case ConditionalOperator.Empty:
    case "empty":
      return current === undefined || current === null || current === "";
    case ConditionalOperator.NotEmpty:
    case "not_empty":
      return current !== undefined && current !== null && current !== "";
    default:
      return true;
  }
}

/** Resolves hidden/required flags from conditional logic (Phase 8 + legacy showWhen). */
export function resolveVisibleFields<T extends IFormField & { fieldId?: string }>(
  fields: T[],
  answers: FormAnswers
): Array<T & { hidden: boolean; required: boolean }> {
  const sorted = [...fields].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const resolved = sorted.map((f) => ({
    ...f,
    fieldId: f.fieldId ?? f.key,
    key: f.key ?? f.fieldId ?? "",
    hidden: !!f.hidden,
    required: !!f.required,
  }));

  for (const field of resolved) {
    const logic =
      (field as T & { conditionalLogic?: IConditionalLogic }).conditionalLogic ?? field.showWhen;
    if (!logic) continue;

    const matches = evaluateConditional(logic, answers);
    const action = getAction(logic);

    switch (action) {
      case ConditionalAction.Show:
        if (!matches) field.hidden = true;
        break;
      case ConditionalAction.Hide:
        if (matches) field.hidden = true;
        break;
      case ConditionalAction.Require:
        if (matches) field.required = true;
        break;
      case ConditionalAction.Unrequire:
        if (matches) field.required = false;
        break;
      default:
        if (!matches) field.hidden = true;
    }
  }

  return resolved;
}

export function getVisibleFieldKeys(fields: IFormField[], answers: FormAnswers): Set<string> {
  return new Set(
    resolveVisibleFields(fields, answers)
      .filter((f) => !f.hidden)
      .map((f) => f.key)
  );
}
