import {
  Building2,
  Briefcase,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  GraduationCap,
  Hash,
  Image,
  Link,
  List,
  Mail,
  Phone,
  ToggleLeft,
  Type,
  Upload,
  User,
} from "lucide-react";
import { FieldType, type FormField, type SegmentStatus } from "@/types/eventBuilder.types";

export type FieldCategory = "basic" | "advanced" | "file" | "contact";

export interface FieldTypeConfig {
  label: string;
  icon: typeof Type;
  defaultValidation: FormField["validation"];
  hasOptions: boolean;
  supportsConditional: boolean;
  category: FieldCategory;
}

export const FIELD_TYPE_CONFIG: Record<FieldType, FieldTypeConfig> = {
  [FieldType.Text]: { label: "Text", icon: Type, defaultValidation: { maxLength: 200 }, hasOptions: false, supportsConditional: true, category: "basic" },
  [FieldType.Textarea]: { label: "Long text", icon: FileText, defaultValidation: { maxLength: 2000 }, hasOptions: false, supportsConditional: true, category: "basic" },
  [FieldType.Email]: { label: "Email", icon: Mail, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "contact" },
  [FieldType.Phone]: { label: "Phone", icon: Phone, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "contact" },
  [FieldType.Number]: { label: "Number", icon: Hash, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "basic" },
  [FieldType.Date]: { label: "Date", icon: Calendar, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "basic" },
  [FieldType.Time]: { label: "Time", icon: Clock, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "basic" },
  [FieldType.Select]: { label: "Dropdown", icon: List, defaultValidation: {}, hasOptions: true, supportsConditional: true, category: "basic" },
  [FieldType.MultiSelect]: { label: "Multi select", icon: List, defaultValidation: {}, hasOptions: true, supportsConditional: true, category: "basic" },
  [FieldType.Radio]: { label: "Radio", icon: CheckSquare, defaultValidation: {}, hasOptions: true, supportsConditional: true, category: "basic" },
  [FieldType.Checkbox]: { label: "Checkbox", icon: CheckSquare, defaultValidation: {}, hasOptions: true, supportsConditional: true, category: "basic" },
  [FieldType.Toggle]: { label: "Toggle", icon: ToggleLeft, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "basic" },
  [FieldType.File]: { label: "File", icon: Upload, defaultValidation: { maxFileSizeMB: 5 }, hasOptions: false, supportsConditional: true, category: "file" },
  [FieldType.Image]: {
    label: "Image",
    icon: Image,
    defaultValidation: {
      maxFileSizeMB: 3,
      allowedFileTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    },
    hasOptions: false,
    supportsConditional: true,
    category: "file",
  },
  [FieldType.Url]: { label: "URL", icon: Link, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "basic" },
  [FieldType.SocialLink]: { label: "Social link", icon: Link, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "contact" },
  [FieldType.StudentId]: { label: "Student ID", icon: GraduationCap, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "advanced" },
  [FieldType.University]: { label: "University", icon: GraduationCap, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "advanced" },
  [FieldType.Department]: { label: "Department", icon: Building2, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "advanced" },
  [FieldType.Company]: { label: "Company", icon: Building2, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "advanced" },
  [FieldType.Designation]: { label: "Designation", icon: Briefcase, defaultValidation: {}, hasOptions: false, supportsConditional: true, category: "advanced" },
  [FieldType.ExperienceLevel]: { label: "Experience", icon: User, defaultValidation: {}, hasOptions: true, supportsConditional: true, category: "advanced" },
};

export const SEGMENT_STATUS_CONFIG: Record<
  SegmentStatus,
  { label: string; color: string }
> = {
  draft: { label: "Draft", color: "bg-zinc-500/20 text-zinc-300" },
  active: { label: "Active", color: "bg-emerald-500/20 text-emerald-300" },
  soldout: { label: "Sold out", color: "bg-amber-500/20 text-amber-300" },
  hidden: { label: "Hidden", color: "bg-zinc-600/30 text-zinc-400" },
  expired: { label: "Expired", color: "bg-red-500/20 text-red-300" },
};

export function createDefaultField(type: FieldType, order: number): FormField {
  const cfg = FIELD_TYPE_CONFIG[type];
  const fieldId = `field_${Date.now().toString(36)}_${order}`;
  return {
    fieldId,
    type,
    label: cfg.label,
    placeholder: "",
    required: false,
    hidden: false,
    readonly: false,
    options: cfg.hasOptions ? ["Option 1", "Option 2"] : undefined,
    validation: cfg.defaultValidation,
    order,
  };
}

export const FIELD_TYPES_BY_CATEGORY: Record<FieldCategory, FieldType[]> = {
  basic: Object.entries(FIELD_TYPE_CONFIG)
    .filter(([, c]) => c.category === "basic")
    .map(([t]) => t as FieldType),
  contact: Object.entries(FIELD_TYPE_CONFIG)
    .filter(([, c]) => c.category === "contact")
    .map(([t]) => t as FieldType),
  file: Object.entries(FIELD_TYPE_CONFIG)
    .filter(([, c]) => c.category === "file")
    .map(([t]) => t as FieldType),
  advanced: Object.entries(FIELD_TYPE_CONFIG)
    .filter(([, c]) => c.category === "advanced")
    .map(([t]) => t as FieldType),
};
