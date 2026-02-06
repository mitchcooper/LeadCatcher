import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS
// =============================================================================

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  showLabels?: boolean;
  labels?: string[];
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProgressIndicator({
  currentStep,
  totalSteps,
  showLabels = false,
  labels = ["Address", "Relationship", "Timeline", "Contact"],
  className,
}: ProgressIndicatorProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="relative">
        {/* Background track */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Filled progress */}
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Step indicators */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <motion.div
                key={stepNumber}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  isCompleted && "bg-primary text-white",
                  isCurrent && "bg-primary text-white ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "bg-gray-200 text-gray-500"
                )}
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  stepNumber
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Labels */}
      {showLabels && labels.length > 0 && (
        <div className="flex justify-between mt-4">
          {labels.slice(0, totalSteps).map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <span
                key={label}
                className={cn(
                  "text-xs font-medium transition-colors",
                  isCompleted && "text-primary",
                  isCurrent && "text-primary",
                  !isCompleted && !isCurrent && "text-gray-400"
                )}
              >
                {label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPACT PROGRESS (percentage only)
// =============================================================================

interface CompactProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function CompactProgress({
  currentStep,
  totalSteps,
  className,
}: CompactProgressProps) {
  const progress = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <span className="text-sm font-medium text-gray-500 tabular-nums">
        {progress}%
      </span>
    </div>
  );
}
