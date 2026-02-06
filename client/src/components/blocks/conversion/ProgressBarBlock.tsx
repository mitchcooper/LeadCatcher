import { motion } from "framer-motion";
import { blockRegistry, type BlockProps } from "@/lib/blocks/registry";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS TYPES
// =============================================================================

export interface ProgressBarBlockProps {
  current: number;
  total: number;
  showLabels?: boolean;
  showPercentage?: boolean;
  variant?: "default" | "stepped" | "dots";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

const sizeClasses = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const dotSizes = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

export function ProgressBarBlock({
  props,
}: BlockProps<ProgressBarBlockProps>) {
  const {
    current = 1,
    total = 4,
    showLabels = false,
    showPercentage = false,
    variant = "default",
    size = "md",
    animated = true,
  } = props;

  const percentage = Math.round((current / total) * 100);
  const clampedCurrent = Math.min(Math.max(current, 0), total);

  // Stepped variant
  if (variant === "stepped") {
    return (
      <div className="w-full">
        {showLabels && (
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-gray-600">Step {clampedCurrent} of {total}</span>
            {showPercentage && (
              <span className="text-primary font-medium">{percentage}%</span>
            )}
          </div>
        )}
        <div className="flex gap-2">
          {Array.from({ length: total }).map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                "flex-1 rounded-full",
                sizeClasses[size],
                index < clampedCurrent ? "bg-primary" : "bg-gray-200"
              )}
              initial={animated ? { scaleX: 0 } : false}
              animate={{ scaleX: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Dots variant
  if (variant === "dots") {
    return (
      <div className="w-full">
        {showLabels && (
          <div className="flex justify-center mb-3 text-sm text-gray-600">
            Step {clampedCurrent} of {total}
          </div>
        )}
        <div className="flex justify-center gap-3">
          {Array.from({ length: total }).map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                "rounded-full transition-all duration-300",
                dotSizes[size],
                index < clampedCurrent
                  ? "bg-primary"
                  : index === clampedCurrent
                  ? "bg-primary/50 ring-2 ring-primary ring-offset-2"
                  : "bg-gray-200"
              )}
              initial={animated ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default (continuous bar) variant
  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-gray-600">Step {clampedCurrent} of {total}</span>
          {showPercentage && (
            <span className="text-primary font-medium">{percentage}%</span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", sizeClasses[size])}>
        <motion.div
          className={cn("h-full bg-primary rounded-full")}
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// =============================================================================
// BLOCK REGISTRATION
// =============================================================================

blockRegistry.register("progress-bar", ProgressBarBlock, {
  name: "Progress Bar",
  description: "Visual progress indicator for multi-step forms",
  category: "conversion",
  icon: "Loader",
  defaultProps: {
    current: 1,
    total: 4,
    showLabels: true,
    showPercentage: false,
    variant: "default",
    size: "md",
    animated: true,
  },
  propsSchema: [
    { key: "current", label: "Current Step", type: "number" },
    { key: "total", label: "Total Steps", type: "number" },
    { key: "showLabels", label: "Show Labels", type: "boolean", default: true },
    { key: "showPercentage", label: "Show Percentage", type: "boolean", default: false },
    {
      key: "variant",
      label: "Style",
      type: "select",
      options: [
        { label: "Continuous", value: "default" },
        { label: "Stepped", value: "stepped" },
        { label: "Dots", value: "dots" },
      ],
      default: "default",
    },
    {
      key: "size",
      label: "Size",
      type: "select",
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
      default: "md",
    },
    { key: "animated", label: "Animated", type: "boolean", default: true },
  ],
});
