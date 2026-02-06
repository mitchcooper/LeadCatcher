import { blockRegistry, type BlockProps, type BlockConfig } from "@/lib/blocks/registry";
import { BlockRenderer } from "../BlockRenderer";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface CardBlockProps {
  children?: BlockConfig[];
  variant?: "default" | "elevated" | "bordered" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  hover?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

const variantClasses = {
  default: "bg-white border border-gray-200 shadow-sm",
  elevated: "bg-white shadow-lg",
  bordered: "bg-white border-2 border-gray-200",
  ghost: "bg-transparent",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

export function CardBlock({
  props,
  isEditing,
}: BlockProps<CardBlockProps>) {
  const {
    children = [],
    variant = "default",
    padding = "md",
    rounded = "xl",
    hover = false,
  } = props;

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        roundedClasses[rounded],
        hover && "transition-all duration-200 hover:shadow-md hover:-translate-y-1",
        isEditing && "ring-1 ring-dashed ring-gray-300"
      )}
    >
      {children.map((blockConfig) => (
        <BlockRenderer
          key={blockConfig.id}
          config={blockConfig}
          isEditing={isEditing}
        />
      ))}
      {children.length === 0 && isEditing && (
        <div className="p-4 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded">
          Add blocks to this card
        </div>
      )}
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("card", CardBlock, {
  name: "Card",
  description: "Card wrapper with shadow and border options",
  category: "layout",
  icon: "CreditCard",
  defaultProps: {
    children: [],
    variant: "default",
    padding: "md",
    rounded: "xl",
    hover: false,
  },
  propsSchema: [
    {
      key: "variant",
      label: "Style",
      type: "select",
      options: [
        { label: "Default", value: "default" },
        { label: "Elevated", value: "elevated" },
        { label: "Bordered", value: "bordered" },
        { label: "Ghost", value: "ghost" },
      ],
      default: "default",
    },
    {
      key: "padding",
      label: "Padding",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
      default: "md",
    },
    {
      key: "rounded",
      label: "Border Radius",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
        { label: "2X Large", value: "2xl" },
      ],
      default: "xl",
    },
    { key: "hover", label: "Hover Effect", type: "boolean", default: false },
  ],
});
