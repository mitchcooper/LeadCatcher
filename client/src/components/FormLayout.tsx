import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapDisplay } from "./MapDisplay";
import { useAppraisalForm } from "@/context/AppraisalFormContext";
import { cn } from "@/lib/utils";

// =============================================================================
// PROPS
// =============================================================================

interface FormLayoutProps {
  children: ReactNode;
  className?: string;
  showMapOnStep?: number; // Step number when map appears (default: 2)
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FormLayout({
  children,
  className,
  showMapOnStep = 2,
}: FormLayoutProps) {
  const { currentStep, mapCoordinates } = useAppraisalForm();

  const showMap = currentStep >= showMapOnStep;

  return (
    <div className={cn("flex flex-col lg:flex-row min-h-[calc(100vh-8rem)]", className)}>
      {/* Form Column */}
      <motion.div
        className={cn(
          "w-full px-4 sm:px-6 lg:px-8 py-8",
          showMap ? "lg:w-1/2" : "lg:max-w-2xl lg:mx-auto"
        )}
        layout
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {children}
      </motion.div>

      {/* Map Column - Desktop only */}
      <AnimatePresence mode="wait">
        {showMap && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "50%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="hidden lg:block sticky top-20 h-[calc(100vh-8rem)] p-4"
          >
            <div className="h-full rounded-2xl overflow-hidden shadow-lg">
              <MapDisplay
                coordinates={mapCoordinates}
                height="100%"
                className="h-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// SPLIT FORM LAYOUT (Alternative - explicit split)
// =============================================================================

interface SplitFormLayoutProps {
  formContent: ReactNode;
  showMap?: boolean;
  className?: string;
}

export function SplitFormLayout({
  formContent,
  showMap = true,
  className,
}: SplitFormLayoutProps) {
  const { mapCoordinates } = useAppraisalForm();

  return (
    <div className={cn("flex flex-col lg:flex-row min-h-[calc(100vh-8rem)] gap-6", className)}>
      {/* Form Panel */}
      <div
        className={cn(
          "flex-1 px-4 sm:px-6 py-8",
          showMap ? "lg:w-1/2 lg:max-w-none" : "max-w-2xl mx-auto"
        )}
      >
        {formContent}
      </div>

      {/* Map Panel */}
      {showMap && (
        <div className="hidden lg:flex lg:w-1/2 items-stretch p-4">
          <div className="flex-1 rounded-2xl overflow-hidden shadow-lg bg-gray-100">
            <MapDisplay
              coordinates={mapCoordinates}
              height="100%"
              className="h-full min-h-[400px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
