import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface HeroImageBlockProps {
  imageUrl: string;
  altText?: string;
  height?: "sm" | "md" | "lg" | "xl" | "full";
  overlay?: boolean;
  overlayOpacity?: number;
  objectPosition?: "top" | "center" | "bottom";
}

// =============================================================================
// COMPONENT
// =============================================================================

const heightClasses = {
  sm: "h-[300px]",
  md: "h-[400px]",
  lg: "h-[500px]",
  xl: "h-[600px]",
  full: "h-screen",
};

export function HeroImageBlock({
  props,
  isEditing,
}: BlockProps<HeroImageBlockProps>) {
  const {
    imageUrl,
    altText = "Hero image",
    height = "lg",
    overlay = true,
    overlayOpacity = 30,
    objectPosition = "center",
  } = props;

  // Editing mode placeholder
  if (isEditing && !imageUrl) {
    return (
      <div
        className={cn(
          "w-full bg-gray-200 flex items-center justify-center",
          heightClasses[height]
        )}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">Add hero image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden", heightClasses[height])}>
      {/* Background image */}
      <img
        src={imageUrl}
        alt={altText}
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          objectPosition === "top" && "object-top",
          objectPosition === "center" && "object-center",
          objectPosition === "bottom" && "object-bottom"
        )}
      />

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("hero-image", HeroImageBlock, {
  name: "Hero Image",
  description: "Full-width hero image with optional overlay",
  category: "content",
  icon: "Image",
  defaultProps: {
    imageUrl: "",
    altText: "Hero image",
    height: "lg",
    overlay: true,
    overlayOpacity: 30,
    objectPosition: "center",
  },
  propsSchema: [
    { key: "imageUrl", label: "Image URL", type: "image", required: true },
    { key: "altText", label: "Alt Text", type: "text" },
    {
      key: "height",
      label: "Height",
      type: "select",
      options: [
        { label: "Small (300px)", value: "sm" },
        { label: "Medium (400px)", value: "md" },
        { label: "Large (500px)", value: "lg" },
        { label: "Extra Large (600px)", value: "xl" },
        { label: "Full Screen", value: "full" },
      ],
      default: "lg",
    },
    { key: "overlay", label: "Show Overlay", type: "boolean", default: true },
    { key: "overlayOpacity", label: "Overlay Opacity (%)", type: "number", default: 30 },
    {
      key: "objectPosition",
      label: "Image Position",
      type: "select",
      options: [
        { label: "Top", value: "top" },
        { label: "Center", value: "center" },
        { label: "Bottom", value: "bottom" },
      ],
      default: "center",
    },
  ],
});
