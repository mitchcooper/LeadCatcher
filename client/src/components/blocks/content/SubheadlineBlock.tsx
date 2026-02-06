import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface SubheadlineBlockProps {
  text: string;
  align?: "left" | "center" | "right";
  color?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

// =============================================================================
// COMPONENT
// =============================================================================

const alignClasses = {
  left: "text-left",
  center: "text-center mx-auto",
  right: "text-right ml-auto",
};

const maxWidthClasses = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-none",
};

export function SubheadlineBlock({
  props,
}: BlockProps<SubheadlineBlockProps>) {
  const {
    text = "Your subheadline text goes here",
    align = "center",
    color,
    maxWidth = "lg",
  } = props;

  return (
    <p
      className={cn(
        "text-lg sm:text-xl text-gray-600 leading-relaxed",
        alignClasses[align],
        maxWidthClasses[maxWidth]
      )}
      style={{ color: color || undefined }}
    >
      {text}
    </p>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("subheadline", SubheadlineBlock, {
  name: "Subheadline",
  description: "Supporting text below headlines",
  category: "content",
  icon: "Text",
  defaultProps: {
    text: "Your subheadline text goes here",
    align: "center",
    maxWidth: "lg",
  },
  propsSchema: [
    { key: "text", label: "Text", type: "textarea", required: true },
    {
      key: "align",
      label: "Alignment",
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      default: "center",
    },
    { key: "color", label: "Color", type: "color" },
    {
      key: "maxWidth",
      label: "Max Width",
      type: "select",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
        { label: "Extra Large", value: "xl" },
        { label: "Full Width", value: "full" },
      ],
      default: "lg",
    },
  ],
});
