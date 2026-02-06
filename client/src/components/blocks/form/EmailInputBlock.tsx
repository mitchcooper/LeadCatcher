import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface EmailInputBlockProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  fieldName?: string;
}

// =============================================================================
// EMAIL VALIDATION PATTERN
// =============================================================================

const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: "Please enter a valid email address",
};

// =============================================================================
// COMPONENT
// =============================================================================

export function EmailInputBlock({
  id,
  props,
  isEditing,
  formContext,
}: BlockProps<EmailInputBlockProps>) {
  const {
    label = "Email Address",
    placeholder = "you@example.com",
    helperText,
    required = true,
    fieldName = "email",
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

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          id={id}
          type="email"
          placeholder={placeholder}
          disabled={isEditing}
          autoComplete="email"
          className={cn(
            "pl-10 h-12 text-base",
            fieldError && "border-red-500 focus:ring-red-500"
          )}
          {...(register && !isEditing
            ? register(fieldName, {
                required: required ? "Email is required" : false,
                pattern: emailPattern,
              })
            : {})}
        />
      </div>

      {fieldError && (
        <p className="text-sm text-red-500">{String(fieldError.message ?? "")}</p>
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

blockRegistry.register("email-input", EmailInputBlock, {
  name: "Email Input",
  description: "Email address input with validation",
  category: "form",
  icon: "Mail",
  defaultProps: {
    label: "Email Address",
    placeholder: "you@example.com",
    required: true,
    fieldName: "email",
  },
  propsSchema: [
    { key: "label", label: "Label", type: "text", default: "Email Address" },
    { key: "placeholder", label: "Placeholder", type: "text", default: "you@example.com" },
    { key: "helperText", label: "Helper Text", type: "text" },
    { key: "required", label: "Required", type: "boolean", default: true },
    { key: "fieldName", label: "Field Name", type: "text", default: "email" },
  ],
});
