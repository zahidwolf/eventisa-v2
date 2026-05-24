import { randomUUID } from "crypto";
import type {
  FormFieldCondition,
  IFormField,
} from "@/modules/forms/types/form-field.types.js";
import type { ITicketSection } from "@/modules/events/models/ticket-section.schema.js";
import {
  SegmentVisibility,
  type ITicketSegment,
} from "@/modules/events/models/ticketSegment.model.js";
import {
  ConditionalAction,
  ConditionalOperator,
  type IBuilderFormField,
  type IConditionalLogic,
} from "@/modules/events/models/formField.model.js";

type SectionDoc = ITicketSection & { _id?: { toString(): string } };

function toApiConditional(
  logic?: FormFieldCondition | IConditionalLogic,
  showWhen?: FormFieldCondition
): IConditionalLogic | undefined {
  const src = logic ?? showWhen;
  if (!src) return undefined;
  const dependsOn =
    src.dependsOn ?? ("fieldKey" in src ? src.fieldKey : undefined) ?? "";
  return {
    dependsOn,
    operator: (src.operator ?? ConditionalOperator.Equals) as ConditionalOperator,
    value: src.value,
    action: (src.action ?? ConditionalAction.Show) as ConditionalAction,
  };
}

export function sectionDocId(section: SectionDoc): string {
  return section.segmentId ?? section._id?.toString() ?? "";
}

export function toApiSegment(section: SectionDoc): ITicketSegment {
  const id = sectionDocId(section);
  const remaining =
    section.remainingQuantity ??
    Math.max(0, section.capacity - (section.quantitySold ?? 0));

  return {
    segmentId: id,
    name: section.name ?? section.title,
    title: section.title,
    description: section.description,
    price: section.price,
    isFree: section.isFree,
    capacity: section.capacity,
    remainingQuantity: remaining,
    quantitySold: section.quantitySold,
    maxPurchasePerUser: section.maxPurchasePerUser ?? section.maxPurchase,
    maxPurchase: section.maxPurchase,
    minPurchase: section.minPurchase,
    saleStart: section.saleStart,
    saleEnd: section.saleEnd,
    visibility:
      section.visibility ??
      (section.isVisible ? SegmentVisibility.Public : SegmentVisibility.Hidden),
    isVisible: section.isVisible,
    ticketColor: section.ticketColor,
    status: section.status,
    formEnabled: section.formEnabled,
    formFields: (section.formFields ?? []).map(toApiField),
    benefits: section.benefits,
    seatType: section.seatType,
  };
}

export function toApiField(field: IFormField & { fieldId?: string }): IBuilderFormField {
  const fieldId = field.fieldId ?? field.key;
  const logic = (field as IFormField & { conditionalLogic?: IBuilderFormField["conditionalLogic"] })
    .conditionalLogic;

  return {
    fieldId,
    key: field.key,
    type: field.type as unknown as IBuilderFormField["type"],
    label: field.label,
    placeholder: field.placeholder,
    helperText: field.helperText,
    required: field.required,
    hidden: field.hidden,
    readonly: field.readonly,
    defaultValue: field.defaultValue,
    options: field.options,
    validation: field.validation
      ? {
          minLength: field.validation.minLength,
          maxLength: field.validation.maxLength,
          min: field.validation.min,
          max: field.validation.max,
          regex: (field.validation as { regex?: string; pattern?: string }).regex ?? field.validation.pattern,
          regexMessage:
            (field.validation as { regexMessage?: string; patternMessage?: string }).regexMessage ??
            field.validation.patternMessage,
        }
      : undefined,
    conditionalLogic: toApiConditional(logic, field.showWhen),
    order: field.order ?? 0,
  };
}

export function fromApiField(input: Partial<IBuilderFormField>): IFormField {
  const fieldId = input.fieldId ?? input.key ?? randomUUID();
  return {
    fieldId,
    key: fieldId,
    label: input.label ?? "Untitled",
    type: input.type as unknown as IFormField["type"],
    required: input.required ?? false,
    placeholder: input.placeholder,
    helperText: input.helperText,
    defaultValue: input.defaultValue,
    options: input.options,
    order: input.order ?? 0,
    hidden: input.hidden,
    readonly: input.readonly,
    validation: input.validation
      ? {
          min: input.validation.min,
          max: input.validation.max,
          minLength: input.validation.minLength,
          maxLength: input.validation.maxLength,
          pattern: input.validation.regex,
          patternMessage: input.validation.regexMessage,
        }
      : undefined,
    showWhen: input.conditionalLogic
      ? {
          fieldKey: input.conditionalLogic.dependsOn,
          operator: input.conditionalLogic.operator as FormFieldCondition["operator"],
          value: input.conditionalLogic.value,
        }
      : undefined,
    conditionalLogic: input.conditionalLogic,
  } as IFormField & { fieldId: string; conditionalLogic?: IBuilderFormField["conditionalLogic"] };
}

export function fromApiSegment(input: Partial<ITicketSegment>): Partial<ITicketSection> {
  const name = input.name ?? input.title ?? "Untitled";
  return {
    segmentId: input.segmentId,
    title: name,
    name,
    description: input.description,
    price: input.price ?? 0,
    isFree: input.isFree ?? false,
    capacity: input.capacity ?? 1,
    remainingQuantity: input.remainingQuantity ?? input.capacity,
    quantitySold: input.quantitySold ?? 0,
    maxPurchase: input.maxPurchasePerUser ?? input.maxPurchase ?? 10,
    maxPurchasePerUser: input.maxPurchasePerUser ?? input.maxPurchase ?? 10,
    minPurchase: input.minPurchase ?? 1,
    saleStart: input.saleStart,
    saleEnd: input.saleEnd,
    visibility: input.visibility,
    isVisible: input.visibility !== SegmentVisibility.Hidden,
    ticketColor: input.ticketColor,
    status: input.status,
    formEnabled: input.formEnabled ?? (input.formFields?.length ? true : false),
    formFields: (input.formFields ?? []).map(fromApiField),
    benefits: input.benefits,
    seatType: input.seatType,
  };
}
