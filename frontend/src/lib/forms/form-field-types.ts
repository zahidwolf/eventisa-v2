export const FORM_FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "phone",
  "number",
  "date",
  "time",
  "select",
  "multi-select",
  "radio",
  "checkbox",
  "toggle",
  "file",
  "image",
  "url",
  "social",
  "student-id",
  "university",
  "department",
  "company",
  "designation",
  "experience-level",
] as const;

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];

export type SegmentStatus = "draft" | "active" | "soldout" | "hidden" | "expired";

export interface FormFieldCondition {
  fieldKey: string;
  operator: "equals" | "not_equals" | "contains" | "checked";
  value?: string | boolean;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface DynamicFormField {
  key: string;
  label: string;
  type: FormFieldType | string;
  required: boolean;
  placeholder?: string;
  helperText?: string;
  defaultValue?: string;
  options?: string[];
  order: number;
  hidden?: boolean;
  readonly?: boolean;
  validation?: FormFieldValidation;
  showWhen?: FormFieldCondition;
}

export interface TicketSegment {
  _id?: string;
  title: string;
  description?: string;
  price: number;
  isFree: boolean;
  capacity: number;
  quantitySold: number;
  maxPurchase: number;
  minPurchase: number;
  benefits: string[];
  isVisible: boolean;
  saleStart?: string;
  saleEnd?: string;
  status?: SegmentStatus;
  seatType?: string;
  ticketColor?: string;
  formEnabled: boolean;
  formFields: DynamicFormField[];
}

export function resolveSegmentFormFields(
  segment: TicketSegment,
  eventForm?: { enabled: boolean; fields: DynamicFormField[] }
): DynamicFormField[] {
  if (segment.formFields?.length) return segment.formFields;
  if (eventForm?.enabled) return eventForm.fields;
  return [];
}

export function isSegmentFree(segment: Pick<TicketSegment, "isFree" | "price">) {
  return segment.isFree || segment.price === 0;
}
