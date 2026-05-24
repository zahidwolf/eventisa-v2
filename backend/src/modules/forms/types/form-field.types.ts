export enum FormFieldType {
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
  Social = "social",
  SocialLink = "social-link",
  StudentId = "student-id",
  University = "university",
  Department = "department",
  Company = "company",
  Designation = "designation",
  ExperienceLevel = "experience-level",
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  regex?: string;
  regexMessage?: string;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
}

export interface FormFieldCondition {
  fieldKey?: string;
  dependsOn?: string;
  operator: string;
  value?: string | boolean | number;
  action?: "show" | "hide" | "require" | "unrequire";
}

export interface IFormField {
  fieldId?: string;
  key: string;
  label: string;
  type: FormFieldType;
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
  conditionalLogic?: FormFieldCondition;
}

export type FormResponseValue = string | string[] | boolean | number;

export interface IFormResponse {
  fieldKey: string;
  sectionId?: string;
  value: FormResponseValue;
}
