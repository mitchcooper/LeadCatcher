import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { stepTransitionVariants, stepTransitionConfig } from "@/lib/animations";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS
// =============================================================================

interface FormStepWrapperProps {
  children: ReactNode;
  stepKey: string | number;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FormStepWrapper({
  children,
  stepKey,
  className,
}: FormStepWrapperProps) {
  return (
    <motion.div
      key={stepKey}
      variants={stepTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={stepTransitionConfig}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
}
