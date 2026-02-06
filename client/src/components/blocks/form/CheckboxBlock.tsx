import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface CheckboxBlockProps {
  label: string;
  helperText?: string;
  required?: boolean;
  fieldName: string;
  linkText?: string;
  linkUrl?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CheckboxBlock({
  id,
  props,
  isEditing,
  formContext,
}: BlockProps<CheckboxBlockProps>) {
  const {
    label,
    helperText,
    required = false,
    fieldName,
    linkText,
    linkUrl,
  } = props;

  const { register, setValue, watch, formState } = formContext || {};
  const isChecked = watch?.(fieldName) || false;
  const fieldError = formState?.errors?.[fieldName];

  const handleCheckedChange = (checked: boolean) => {
    if (isEditing) return;
    setValue?.(fieldName, checked, { shouldValidate: true });
  };

  // Build label with optional link
  const renderLabel = () => {
    if (linkText && linkUrl) {
      const parts = label.split(linkText);
      if (parts.length === 2) {
        return (
          <>
            {parts[0]}
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {linkText}
            </a>
            {parts[1]}
          </>
        );
      }
    }
    return label;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          disabled={isEditing}
          className={cn(
            "mt-1",
            fieldError && "border-red-500"
          )}
        />
        <Label
          htmlFor={id}
          className={cn(
            "text-sm leading-relaxed cursor-pointer",
            isEditing && "cursor-default"
          )}
        >
          {renderLabel()}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>

      {/* Hidden input for form registration */}
      {register && (
        <input
          type="hidden"
          {...register(fieldName, {
            required: required ? "This field is required" : false,
            validate: required ? (value) => value === true || "You must agree to continue" : undefined,
          })}
        />
      )}

      {fieldError && (
        <p className="text-sm text-red-500 ml-7">{String(fieldError.message ?? "")}</p>
      )}

      {!fieldError && helperText && (
        <p className="text-sm text-gray-500 ml-7">{helperText}</p>
      )}
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("checkbox", CheckboxBlock, {
  name: "Checkbox",
  description: "Single checkbox for consent or options",
  category: "form",
  icon: "CheckSquare",
  defaultProps: {
    label: "I agree to the terms and conditions",
    required: true,
    fieldName: "consent",
    linkText: "terms and conditions",
    linkUrl: "/terms",
  },
  propsSchema: [
    { key: "label", label: "Label", type: "text", required: true },
    { key: "helperText", label: "Helper Text", type: "text" },
    { key: "required", label: "Required", type: "boolean", default: true },
    { key: "fieldName", label: "Field Name", type: "text", required: true },
    { key: "linkText", label: "Link Text (in label)", type: "text" },
    { key: "linkUrl", label: "Link URL", type: "text" },
  ],
});
