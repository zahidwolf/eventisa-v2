import type {
  FormFieldCondition,
  FormResponseValue,
} from "@/modules/forms/types/form-field.types.js";

export function evaluateCondition(
  condition: FormFieldCondition | undefined,
  values: Record<string, FormResponseValue>
): boolean {
  if (!condition) return true;

  const key = condition.fieldKey ?? condition.dependsOn;
  if (!key) return true;
  const current = values[key];
  const target = condition.value;

  switch (condition.operator) {
    case "equals":
      return String(current ?? "") === String(target ?? "");
    case "not_equals":
      return String(current ?? "") !== String(target ?? "");
    case "contains":
      return String(current ?? "").toLowerCase().includes(String(target ?? "").toLowerCase());
    case "checked":
      return current === true || current === "true";
    default:
      return true;
  }
}

export function getVisibleFieldKeys(
  fields: { key: string; hidden?: boolean; showWhen?: FormFieldCondition }[],
  values: Record<string, FormResponseValue>
): Set<string> {
  const visible = new Set<string>();
  for (const f of fields) {
    if (f.hidden) continue;
    if (!evaluateCondition(f.showWhen, values)) continue;
    visible.add(f.key);
  }
  return visible;
}
