import type { ConditionalLogic, FormField } from "@/types/eventBuilder.types";

export type FormAnswers = Record<string, string | string[] | boolean | number | undefined>;

function evaluate(logic: ConditionalLogic, answers: FormAnswers): boolean {
  const current = answers[logic.dependsOn];
  const target = logic.value;
  switch (logic.operator) {
    case "equals":
      return String(current ?? "") === String(target ?? "");
    case "not_equals":
      return String(current ?? "") !== String(target ?? "");
    case "contains":
      return String(current ?? "").toLowerCase().includes(String(target ?? "").toLowerCase());
    case "not_contains":
      return !String(current ?? "").toLowerCase().includes(String(target ?? "").toLowerCase());
    case "greater_than":
      return Number(current) > Number(target);
    case "less_than":
      return Number(current) < Number(target);
    case "checked":
      return current === true || current === "true";
    case "empty":
      return current === undefined || current === null || current === "";
    case "not_empty":
      return current !== undefined && current !== null && current !== "";
    default:
      return true;
  }
}

/** Phase 8 conditional resolution — show/hide/require/unrequire in field order. */
export function resolveVisibleFields(fields: FormField[], answers: FormAnswers): FormField[] {
  const sorted = [...fields].sort((a, b) => a.order - b.order);
  const resolved = sorted.map((f) => ({
    ...f,
    hidden: !!f.hidden,
    required: !!f.required,
  }));

  for (const field of resolved) {
    if (!field.conditionalLogic) continue;
    const matches = evaluate(field.conditionalLogic, answers);
    switch (field.conditionalLogic.action) {
      case "show":
        if (!matches) field.hidden = true;
        break;
      case "hide":
        if (matches) field.hidden = true;
        break;
      case "require":
        if (matches) field.required = true;
        break;
      case "unrequire":
        if (matches) field.required = false;
        break;
    }
  }

  return resolved;
}

export function getVisibleFields(fields: FormField[], answers: FormAnswers): FormField[] {
  return resolveVisibleFields(fields, answers).filter((f) => !f.hidden);
}
