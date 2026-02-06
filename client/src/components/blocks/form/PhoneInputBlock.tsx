import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface PhoneInputBlockProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  fieldName?: string;
}

// =============================================================================
// NZ PHONE VALIDATION
// =============================================================================

// NZ phone numbers: landline (09, 07, etc.) or mobile (021, 022, 027, etc.)
const nzPhonePattern = {
  value: /^(\+64|0)[\d\s-]{7,12}$/,
  message: "Please enter a valid NZ phone number",
};

// Format phone number as user types
function formatNZPhone(value: string): string {
  // Remove all non-digit characters except +
  const cleaned = value.replace(/[^\d+]/g, "");

  // If starts with +64, format as international
  if (cleaned.startsWith("+64")) {
    const rest = cleaned.slice(3);
    if (rest.length <= 2) return `+64 ${rest}`;
    if (rest.length <= 5) return `+64 ${rest.slice(0, 2)} ${rest.slice(2)}`;
    return `+64 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 9)}`;
  }

  // Format as local NZ number
  if (cleaned.startsWith("0")) {
    // Mobile (021, 022, etc.)
    if (cleaned.length > 2 && ["21", "22", "27", "28", "29"].includes(cleaned.slice(1, 3))) {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
    }
    // Landline (09, 07, etc.)
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
  }

  return cleaned;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function PhoneInputBlock({
  id,
  props,
  isEditing,
  formContext,
}: BlockProps<PhoneInputBlockProps>) {
  const {
    label = "Phone Number",
    placeholder = "021 123 4567",
    helperText,
    required = true,
    fieldName = "phone",
  } = props;

  const { register, formState, setValue, watch } = formContext || {};
  const fieldError = formState?.errors?.[fieldName];
  const currentValue = watch?.(fieldName) || "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNZPhone(e.target.value);
    setValue?.(fieldName, formatted, { shouldValidate: false });
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          id={id}
          type="tel"
          placeholder={placeholder}
          disabled={isEditing}
          autoComplete="tel"
          value={currentValue}
          onChange={handleChange}
          className={cn(
            "pl-10 h-12 text-base",
            fieldError && "border-red-500 focus:ring-red-500"
          )}
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

blockRegistry.register("phone-input", PhoneInputBlock, {
  name: "Phone Input",
  description: "NZ phone number input with formatting",
  category: "form",
  icon: "Phone",
  defaultProps: {
    label: "Phone Number",
    placeholder: "021 123 4567",
    required: true,
    fieldName: "phone",
  },
  propsSchema: [
    { key: "label", label: "Label", type: "text", default: "Phone Number" },
    { key: "placeholder", label: "Placeholder", type: "text", default: "021 123 4567" },
    { key: "helperText", label: "Helper Text", type: "text" },
    { key: "required", label: "Required", type: "boolean", default: true },
    { key: "fieldName", label: "Field Name", type: "text", default: "phone" },
  ],
});
