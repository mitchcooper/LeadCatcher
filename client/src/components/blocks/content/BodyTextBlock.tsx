import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface BodyTextBlockProps {
  content: string;
  align?: "left" | "center" | "right";
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  prose?: boolean; // Enable prose styling for rich text
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

export function BodyTextBlock({
  props,
}: BlockProps<BodyTextBlockProps>) {
  const {
    content = "Your body text content goes here. This block supports multiple paragraphs and basic formatting.",
    align = "left",
    maxWidth = "lg",
    prose = true,
  } = props;

  return (
    <div
      className={cn(
        alignClasses[align],
        maxWidthClasses[maxWidth],
        prose && "prose prose-gray max-w-none",
        "text-gray-700 leading-relaxed"
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("body-text", BodyTextBlock, {
  name: "Body Text",
  description: "Paragraph text content with rich formatting support",
  category: "content",
  icon: "AlignLeft",
  defaultProps: {
    content: "Your body text content goes here. This block supports multiple paragraphs and basic formatting.",
    align: "left",
    maxWidth: "lg",
    prose: true,
  },
  propsSchema: [
    { key: "content", label: "Content", type: "textarea", required: true },
    {
      key: "align",
      label: "Alignment",
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      default: "left",
    },
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
    { key: "prose", label: "Enable Rich Text Styling", type: "boolean", default: true },
  ],
});
