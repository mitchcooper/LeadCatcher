import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Home, Building, Key, ClipboardList, Zap, Calendar, CalendarDays, HelpCircle, type LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// Icon map for dynamic icon lookup
const iconMap: Record<string, LucideIcon> = {
  Home,
  Building,
  Key,
  ClipboardList,
  Zap,
  Calendar,
  CalendarDays,
  HelpCircle,
};

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: string; // Lucide icon name
}

export interface RadioCardsBlockProps {
  label?: string;
  helperText?: string;
  required?: boolean;
  fieldName: string;
  options: RadioOption[];
  columns?: 1 | 2 | 3 | 4;
  autoAdvance?: boolean; // Automatically proceed to next step on selection
}

// =============================================================================
// COMPONENT
// =============================================================================

export function RadioCardsBlock({
  id,
  props,
  isEditing,
  formContext,
}: BlockProps<RadioCardsBlockProps>) {
  const {
    label,
    helperText,
    required = false,
    fieldName,
    options = [],
    columns = 2,
    autoAdvance = false,
  } = props;

  const { register, setValue, watch, formState } = formContext || {};
  const selectedValue = watch?.(fieldName);
  const fieldError = formState?.errors?.[fieldName];

  const [localValue, setLocalValue] = useState<string | null>(null);
  const currentValue = selectedValue ?? localValue;

  const handleSelect = (value: string) => {
    if (isEditing) return;

    setLocalValue(value);
    setValue?.(fieldName, value, { shouldValidate: true });

    // Dispatch custom event for auto-advance
    if (autoAdvance) {
      window.dispatchEvent(
        new CustomEvent("radioCardSelected", {
          detail: { fieldName, value },
        })
      );
    }
  };

  // Get column class
  const columnClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className="space-y-4">
      {label && (
        <Label className="text-lg font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className={cn("grid gap-3", columnClass)}>
        {options.map((option, index) => {
          const isSelected = currentValue === option.value;
          const IconComponent = option.icon ? iconMap[option.icon] : null;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={isEditing}
              whileHover={!isEditing ? { scale: 1.02 } : {}}
              whileTap={!isEditing ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200",
                "min-h-[120px] text-center",
                isSelected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm",
                isEditing && "cursor-default opacity-70",
                fieldError && !isSelected && "border-red-200"
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}

              {/* Icon */}
              {IconComponent && (
                <IconComponent
                  className={cn(
                    "w-8 h-8 mb-3",
                    isSelected ? "text-primary" : "text-gray-400"
                  )}
                />
              )}

              {/* Label */}
              <span
                className={cn(
                  "font-medium text-base",
                  isSelected ? "text-primary" : "text-gray-900"
                )}
              >
                {option.label}
              </span>

              {/* Description */}
              {option.description && (
                <span className="text-sm text-gray-500 mt-1">
                  {option.description}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Hidden input for form registration */}
      {register && (
        <input
          type="hidden"
          {...register(fieldName, {
            required: required ? "Please select an option" : false,
          })}
        />
      )}

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

blockRegistry.register("radio-cards", RadioCardsBlock, {
  name: "Radio Cards",
  description: "Visual card-style radio button selection",
  category: "form",
  icon: "LayoutGrid",
  defaultProps: {
    label: "Select an option",
    required: true,
    fieldName: "selection",
    options: [
      { value: "option1", label: "Option 1", icon: "Home" },
      { value: "option2", label: "Option 2", icon: "Building" },
    ],
    columns: 2,
    autoAdvance: false,
  },
  propsSchema: [
    { key: "label", label: "Label", type: "text" },
    { key: "helperText", label: "Helper Text", type: "text" },
    { key: "required", label: "Required", type: "boolean", default: true },
    { key: "fieldName", label: "Field Name", type: "text", required: true },
    {
      key: "columns",
      label: "Columns",
      type: "select",
      options: [
        { label: "1 Column", value: "1" },
        { label: "2 Columns", value: "2" },
        { label: "3 Columns", value: "3" },
        { label: "4 Columns", value: "4" },
      ],
      default: "2",
    },
    { key: "autoAdvance", label: "Auto-advance on selection", type: "boolean", default: false },
  ],
});
