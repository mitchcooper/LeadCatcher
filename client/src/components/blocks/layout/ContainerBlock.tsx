import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface ContainerBlockProps {
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  background?: "transparent" | "white" | "gray" | "primary" | "gradient";
  centered?: boolean;
  children?: React.ReactNode;
}

// =============================================================================
// COMPONENT
// =============================================================================

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

const paddingClasses = {
  none: "",
  sm: "py-4 px-4 sm:py-6 sm:px-6",
  md: "py-8 px-4 sm:py-12 sm:px-6",
  lg: "py-12 px-4 sm:py-16 sm:px-6",
  xl: "py-16 px-4 sm:py-24 sm:px-6",
};

const backgroundClasses = {
  transparent: "bg-transparent",
  white: "bg-white",
  gray: "bg-gray-50",
  primary: "bg-primary/5",
  gradient: "bg-gradient-to-br from-primary/5 to-primary/10",
};

export function ContainerBlock({
  props,
  isEditing,
  children,
}: BlockProps<ContainerBlockProps> & { children?: React.ReactNode }) {
  const {
    maxWidth = "xl",
    padding = "md",
    background = "transparent",
    centered = true,
  } = props;

  return (
    <div className={cn(backgroundClasses[background])}>
      <div
        className={cn(
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          centered && "mx-auto",
          isEditing && "ring-1 ring-dashed ring-gray-300"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("container", ContainerBlock, {
  name: "Container",
  description: "Wrapper with max-width, padding, and background options",
  category: "layout",
  icon: "Square",
  defaultProps: {
    maxWidth: "xl",
    padding: "md",
    background: "transparent",
    centered: true,
  },
  propsSchema: [
    {
      key: "maxWidth",
      label: "Max Width",
      type: "select",
      options: [
        { label: "Small (640px)", value: "sm" },
        { label: "Medium (768px)", value: "md" },
        { label: "Large (1024px)", value: "lg" },
        { label: "Extra Large (1280px)", value: "xl" },
        { label: "2X Large (1536px)", value: "2xl" },
        { label: "Full Width", value: "full" },
      ],
      default: "xl",
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
        { label: "Extra Large", value: "xl" },
      ],
      default: "md",
    },
    {
      key: "background",
      label: "Background",
      type: "select",
      options: [
        { label: "Transparent", value: "transparent" },
        { label: "White", value: "white" },
        { label: "Gray", value: "gray" },
        { label: "Primary Light", value: "primary" },
        { label: "Gradient", value: "gradient" },
      ],
      default: "transparent",
    },
    { key: "centered", label: "Center Content", type: "boolean", default: true },
  ],
});
