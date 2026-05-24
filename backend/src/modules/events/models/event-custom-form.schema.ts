import { Schema } from "mongoose";
import {
  FormFieldType,
  type IFormField,
  type FormFieldValidation,
  type FormFieldCondition,
} from "@/modules/forms/types/form-field.types.js";

export { FormFieldType, type IFormField, type FormFieldValidation, type FormFieldCondition };

const conditionSchema = new Schema(
  {
    fieldKey: { type: String },
    dependsOn: { type: String },
    operator: {
      type: String,
      enum: [
        "equals",
        "not_equals",
        "contains",
        "not_contains",
        "greater_than",
        "less_than",
        "checked",
        "empty",
        "not_empty",
      ],
      default: "equals",
    },
    value: Schema.Types.Mixed,
    action: {
      type: String,
      enum: ["show", "hide", "require", "unrequire"],
    },
  },
  { _id: false }
);

const validationSchema = new Schema(
  {
    min: Number,
    max: Number,
    minLength: Number,
    maxLength: Number,
    pattern: String,
    patternMessage: String,
    regex: String,
    regexMessage: String,
    allowedFileTypes: [String],
    maxFileSizeMB: Number,
  },
  { _id: false }
);

export const formFieldSchema = new Schema<IFormField>(
  {
    fieldId: { type: String },
    key: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: Object.values(FormFieldType), required: true },
    required: { type: Boolean, default: false },
    placeholder: String,
    helperText: String,
    defaultValue: String,
    options: [String],
    order: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    validation: validationSchema,
    showWhen: conditionSchema,
    conditionalLogic: conditionSchema,
  },
  { _id: true }
);

formFieldSchema.pre("validate", function syncFieldIds() {
  const doc = this as unknown as IFormField;
  if (!doc.fieldId && doc.key) doc.fieldId = doc.key;
  if (!doc.key && doc.fieldId) doc.key = doc.fieldId;
});

export interface IEventCustomForm {
  enabled: boolean;
  fields: IFormField[];
}

export const eventCustomFormSchema = new Schema<IEventCustomForm>(
  {
    enabled: { type: Boolean, default: false },
    fields: { type: [formFieldSchema], default: [] },
  },
  { _id: false }
);
