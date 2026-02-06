import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import type { BlockConfig } from "@shared/schema";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

// Import all blocks to trigger their registration with the block registry
import "./form";
import "./content";
import "./social-proof";
import "./layout";
import "./conversion";

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const animationVariants = {
  none: {
    initial: {},
    animate: {},
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  },
};

// =============================================================================
// BLOCK RENDERER PROPS
// =============================================================================

interface BlockRendererProps {
  config: BlockConfig;
  isEditing?: boolean;
  onUpdate?: (config: Partial<BlockConfig>) => void;
  onSelect?: () => void;
  formContext?: UseFormReturn<any>;
  className?: string;
  disableAnimations?: boolean;
}

// =============================================================================
// BLOCK RENDERER COMPONENT
// =============================================================================

function BlockRendererComponent({
  config,
  isEditing = false,
  onUpdate,
  onSelect,
  formContext,
  className,
  disableAnimations = false,
}: BlockRendererProps) {
  // Get the component from the registry
  const Component = useMemo(() => {
    return blockRegistry.getComponent(config.type);
  }, [config.type]);

  // Check visibility based on screen size (for runtime, we'd use media queries)
  // In editing mode, we always show the block
  const visibility = config.visibility ?? { desktop: true, tablet: true, mobile: true };

  // Get animation settings
  const animation = config.animation ?? { entrance: "none" };
  const animationConfig = animationVariants[animation.entrance] ?? animationVariants.none;

  // Handle missing component
  if (!Component) {
    if (isEditing) {
      return (
        <div
          className={cn(
            "p-4 border-2 border-dashed border-red-300 bg-red-50 rounded-lg",
            className
          )}
        >
          <p className="text-red-600 text-sm font-medium">
            Unknown block type: {config.type}
          </p>
          <p className="text-red-500 text-xs mt-1">
            This block type is not registered in the block registry.
          </p>
        </div>
      );
    }
    // In production, silently skip unknown blocks
    return null;
  }

  // Create the block props
  const blockProps: BlockProps = {
    id: config.id,
    config,
    props: config.props,
    isEditing,
    onUpdate,
    onSelect,
    formContext,
  };

  // Visibility classes
  const visibilityClasses = cn({
    "hidden md:block": !visibility.mobile && visibility.tablet,
    "hidden lg:block": !visibility.mobile && !visibility.tablet && visibility.desktop,
    "md:hidden": visibility.mobile && !visibility.tablet && !visibility.desktop,
    "lg:hidden": visibility.mobile && visibility.tablet && !visibility.desktop,
  });

  // Wrap in motion div for animations if not disabled
  if (!disableAnimations && animation.entrance !== "none") {
    return (
      <motion.div
        initial={animationConfig.initial}
        animate={animationConfig.animate}
        transition={{
          duration: animation.duration ?? 0.4,
          delay: animation.delay ?? 0,
          ease: "easeOut",
        }}
        className={cn(visibilityClasses, className)}
      >
        <Component {...blockProps} />
      </motion.div>
    );
  }

  // Render without animation wrapper
  return (
    <div className={cn(visibilityClasses, className)}>
      <Component {...blockProps} />
    </div>
  );
}

// Memoize for performance
export const BlockRenderer = memo(BlockRendererComponent);

// =============================================================================
// BLOCK ERROR BOUNDARY (for production safety)
// =============================================================================

export function BlockErrorFallback({
  blockType,
  error,
}: {
  blockType: string;
  error: Error;
}) {
  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
      <p className="text-red-600 text-sm font-medium">
        Error rendering block: {blockType}
      </p>
      <p className="text-red-500 text-xs mt-1">{error.message}</p>
    </div>
  );
}
