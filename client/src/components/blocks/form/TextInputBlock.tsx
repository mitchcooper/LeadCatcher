import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface TextInputBlockProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  fieldName: string;
  type?: "text" | "tel";
  autoComplete?: string;
  maxLength?: number;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function TextInputBlock({
  id,
  props,
  isEditing,
  formContext,
}: BlockProps<TextInputBlockProps>) {
  const {
    label,
    placeholder,
    helperText,
    required = false,
    fieldName,
    type = "text",
    autoComplete,
    maxLength,
  } = props;

  const { register, formState } = formContext || {};
  const fieldError = formState?.errors?.[fieldName];

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={isEditing}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={cn(
          "h-12 text-base",
          fieldError && "border-red-500 focus:ring-red-500"
        )}
        {...(register && !isEditing
          ? register(fieldName, { required: required ? `${label || fieldName} is required` : false })
          : {})}
      />

      {fieldError && (
        <p className="text-sm text-red-500">{fieldError.message as string}</p>
      )}

      {!fieldError && helperText && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("text-input", TextInputBlock, {
  name: "Text Input",
  description: "Single line text input field",
  category: "form",
  icon: "Type",
  defaultProps: {
    label: "Text Field",
    placeholder: "Enter text...",
    required: false,
    fieldName: "textField",
    type: "text",
  },
  propsSchema: [
    { key: "label", label: "Label", type: "text", default: "Text Field" },
    { key: "placeholder", label: "Placeholder", type: "text" },
    { key: "helperText", label: "Helper Text", type: "text" },
    { key: "required", label: "Required", type: "boolean", default: false },
    { key: "fieldName", label: "Field Name", type: "text", required: true },
    {
      key: "type",
      label: "Input Type",
      type: "select",
      options: [
        { label: "Text", value: "text" },
        { label: "Phone", value: "tel" },
      ],
      default: "text",
    },
    { key: "autoComplete", label: "Autocomplete", type: "text" },
  ],
});
