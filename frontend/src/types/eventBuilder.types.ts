export enum FieldType {
  Text = "text",
  Textarea = "textarea",
  Email = "email",
  Phone = "phone",
  Number = "number",
  Date = "date",
  Time = "time",
  Select = "select",
  MultiSelect = "multi-select",
  Radio = "radio",
  Checkbox = "checkbox",
  Toggle = "toggle",
  File = "file",
  Image = "image",
  Url = "url",
  SocialLink = "social-link",
  StudentId = "student-id",
  University = "university",
  Department = "department",
  Company = "company",
  Designation = "designation",
  ExperienceLevel = "experience-level",
}

export type ConditionalOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "checked"
  | "empty"
  | "not_empty";

export type ConditionalAction = "show" | "hide" | "require" | "unrequire";

export interface ConditionalLogic {
  dependsOn: string;
  operator: ConditionalOperator;
  value?: string | boolean | number;
  action: ConditionalAction;
}

export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  regex?: string;
  regexMessage?: string;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
}

export interface FormField {
  fieldId: string;
  type: FieldType | string;
  label: string;
  placeholder?: string;
  helperText?: string;
  required: boolean;
  hidden?: boolean;
  readonly?: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: ValidationRules;
  conditionalLogic?: ConditionalLogic;
  order: number;
}

export type SegmentStatus = "draft" | "active" | "soldout" | "hidden" | "expired";
export type SegmentVisibility = "public" | "hidden" | "unlisted";

export interface TicketSegment {
  segmentId: string;
  name: string;
  description?: string;
  price: number;
  isFree: boolean;
  capacity: number;
  remainingQuantity: number;
  maxPurchasePerUser: number;
  minPurchase: number;
  saleStart?: string;
  saleEnd?: string;
  visibility: SegmentVisibility;
  ticketColor?: string;
  status: SegmentStatus;
  formFields: FormField[];
}

export type BuilderTabId =
  | "basic"
  | "media"
  | "venue"
  | "segments"
  | "forms"
  | "preview";

export interface EventBuilderState {
  eventId?: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  venueName: string;
  venueCity: string;
  startDate: string;
  endDate: string;
  globalFormFields: FormField[];
  segments: TicketSegment[];
  activeTab: BuilderTabId;
  dirtyTabs: BuilderTabId[];
}
