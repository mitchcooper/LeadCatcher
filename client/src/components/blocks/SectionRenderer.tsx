import { memo } from "react";
import { BlockRenderer } from "./BlockRenderer";
import type { PageSection } from "@shared/schema";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

// =============================================================================
// SECTION RENDERER PROPS
// =============================================================================

interface SectionRendererProps {
  section: PageSection;
  isEditing?: boolean;
  onBlockUpdate?: (blockId: string, config: Record<string, unknown>) => void;
  onBlockSelect?: (blockId: string) => void;
  formContext?: UseFormReturn<any>;
  className?: string;
}

// =============================================================================
// SECTION RENDERER COMPONENT
// =============================================================================

function SectionRendererComponent({
  section,
  isEditing = false,
  onBlockUpdate,
  onBlockSelect,
  formContext,
  className,
}: SectionRendererProps) {
  // Build background styles
  const backgroundStyles = getBackgroundStyles(section.background);

  // Build padding styles
  const paddingStyles = {
    paddingTop: section.padding?.top ?? "2rem",
    paddingBottom: section.padding?.bottom ?? "2rem",
  };

  return (
    <section
      id={section.id}
      className={cn("relative", className)}
      style={{
        ...backgroundStyles,
        ...paddingStyles,
      }}
    >
      {/* Background image overlay if using image background */}
      {section.background?.type === "image" && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${section.background.value})` }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}

      {/* Section content */}
      <div className={cn("relative", section.background?.type === "image" && "z-10")}>
        {section.blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            config={block}
            isEditing={isEditing}
            onUpdate={
              onBlockUpdate
                ? (config) => onBlockUpdate(block.id, config)
                : undefined
            }
            onSelect={
              onBlockSelect ? () => onBlockSelect(block.id) : undefined
            }
            formContext={formContext}
          />
        ))}
      </div>
    </section>
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getBackgroundStyles(
  background?: PageSection["background"]
): React.CSSProperties {
  if (!background) {
    return {};
  }

  switch (background.type) {
    case "color":
      return { backgroundColor: background.value };
    case "gradient":
      return { background: background.value };
    case "image":
      // Image is handled separately with an overlay div
      return { position: "relative" };
    default:
      return {};
  }
}

// Memoize for performance
export const SectionRenderer = memo(SectionRendererComponent);

// =============================================================================
// PAGE RENDERER (renders all sections)
// =============================================================================

interface PageRendererProps {
  sections: PageSection[];
  isEditing?: boolean;
  onBlockUpdate?: (sectionId: string, blockId: string, config: Record<string, unknown>) => void;
  onBlockSelect?: (sectionId: string, blockId: string) => void;
  formContext?: UseFormReturn<any>;
  className?: string;
}

export function PageRenderer({
  sections,
  isEditing = false,
  onBlockUpdate,
  onBlockSelect,
  formContext,
  className,
}: PageRendererProps) {
  return (
    <div className={cn("min-h-screen", className)}>
      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          isEditing={isEditing}
          onBlockUpdate={
            onBlockUpdate
              ? (blockId, config) => onBlockUpdate(section.id, blockId, config)
              : undefined
          }
          onBlockSelect={
            onBlockSelect
              ? (blockId) => onBlockSelect(section.id, blockId)
              : undefined
          }
          formContext={formContext}
        />
      ))}
    </div>
  );
}
