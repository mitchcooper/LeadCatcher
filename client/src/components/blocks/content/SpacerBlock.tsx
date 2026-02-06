import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface SpacerBlockProps {
  height?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  hideOnMobile?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

const heightClasses = {
  xs: "h-4",
  sm: "h-8",
  md: "h-12",
  lg: "h-16",
  xl: "h-24",
  "2xl": "h-32",
};

export function SpacerBlock({
  props,
  isEditing,
}: BlockProps<SpacerBlockProps>) {
  const {
    height = "md",
    hideOnMobile = false,
  } = props;

  return (
    <div
      className={cn(
        heightClasses[height],
        hideOnMobile && "hidden sm:block",
        isEditing && "bg-gray-100 border border-dashed border-gray-300"
      )}
      aria-hidden="true"
    />
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("spacer", SpacerBlock, {
  name: "Spacer",
  description: "Add vertical spacing between elements",
  category: "content",
  icon: "Space",
  defaultProps: {
    height: "md",
    hideOnMobile: false,
  },
  propsSchema: [
    {
      key: "height",
      label: "Height",
      type: "select",
      options: [
        { label: "Extra Small (16px)", value: "xs" },
        { label: "Small (32px)", value: "sm" },
        { label: "Medium (48px)", value: "md" },
        { label: "Large (64px)", value: "lg" },
        { label: "Extra Large (96px)", value: "xl" },
        { label: "2X Large (128px)", value: "2xl" },
      ],
      default: "md",
    },
    { key: "hideOnMobile", label: "Hide on Mobile", type: "boolean", default: false },
  ],
});
