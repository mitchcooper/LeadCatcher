import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface HeadlineBlockProps {
  text: string;
  level?: "h1" | "h2" | "h3";
  align?: "left" | "center" | "right";
  color?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

// =============================================================================
// COMPONENT
// =============================================================================

const levelClasses = {
  h1: "text-3xl sm:text-4xl lg:text-5xl font-bold",
  h2: "text-2xl sm:text-3xl lg:text-4xl font-bold",
  h3: "text-xl sm:text-2xl lg:text-3xl font-semibold",
};

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

export function HeadlineBlock({
  props,
  isEditing,
}: BlockProps<HeadlineBlockProps>) {
  const {
    text = "Your Headline Here",
    level = "h1",
    align = "center",
    color,
    maxWidth = "lg",
  } = props;

  const Tag = level;

  return (
    <Tag
      className={cn(
        levelClasses[level],
        alignClasses[align],
        maxWidthClasses[maxWidth],
        "leading-tight"
      )}
      style={{ color: color || undefined }}
    >
      {text}
    </Tag>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("headline", HeadlineBlock, {
  name: "Headline",
  description: "Main headline text with customizable size and alignment",
  category: "content",
  icon: "Type",
  defaultProps: {
    text: "Your Headline Here",
    level: "h1",
    align: "center",
    maxWidth: "lg",
  },
  propsSchema: [
    { key: "text", label: "Text", type: "text", required: true },
    {
      key: "level",
      label: "Heading Level",
      type: "select",
      options: [
        { label: "H1 (Largest)", value: "h1" },
        { label: "H2", value: "h2" },
        { label: "H3", value: "h3" },
      ],
      default: "h1",
    },
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
