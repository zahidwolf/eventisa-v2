import { Schema } from "mongoose";

export enum BuilderFieldType {
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

export enum ConditionalOperator {
  Equals = "equals",
  NotEquals = "not_equals",
  Contains = "contains",
  NotContains = "not_contains",
  GreaterThan = "greater_than",
  LessThan = "less_than",
  Checked = "checked",
  Empty = "empty",
  NotEmpty = "not_empty",
}

export enum ConditionalAction {
  Show = "show",
  Hide = "hide",
  Require = "require",
  Unrequire = "unrequire",
}

export interface IConditionalLogic {
  dependsOn: string;
  operator: ConditionalOperator;
  value?: string | boolean | number;
  action: ConditionalAction;
}

export interface IFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  regex?: string;
  regexMessage?: string;
  allowedFileTypes?: string[];
  maxFileSizeMB?: number;
}

export interface IBuilderFormField {
  fieldId: string;
  /** Legacy alias used by existing orders/forms */
  key?: string;
  type: BuilderFieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  required: boolean;
  hidden?: boolean;
  readonly?: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: IFieldValidation;
  conditionalLogic?: IConditionalLogic;
  order: number;
}

export const conditionalLogicSchema = new Schema<IConditionalLogic>(
  {
    dependsOn: { type: String, required: true },
    operator: {
      type: String,
      enum: Object.values(ConditionalOperator),
      default: ConditionalOperator.Equals,
    },
    value: Schema.Types.Mixed,
    action: {
      type: String,
      enum: Object.values(ConditionalAction),
      required: true,
    },
  },
  { _id: false }
);

export const fieldValidationSchema = new Schema<IFieldValidation>(
  {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    regex: String,
    regexMessage: String,
    allowedFileTypes: [String],
    maxFileSizeMB: Number,
  },
  { _id: false }
);

export const builderFormFieldSchema = new Schema<IBuilderFormField>(
  {
    fieldId: { type: String, required: true },
    key: { type: String },
    type: { type: String, enum: Object.values(BuilderFieldType), required: true },
    label: { type: String, required: true },
    placeholder: String,
    helperText: String,
    required: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    defaultValue: String,
    options: { type: [String], default: [] },
    validation: fieldValidationSchema,
    conditionalLogic: conditionalLogicSchema,
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

builderFormFieldSchema.pre("validate", function syncKeyFromFieldId() {
  if (!this.key && this.fieldId) this.key = this.fieldId;
  if (!this.fieldId && this.key) this.fieldId = this.key;
});
