import { ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { FormStepWrapper } from "./FormStepWrapper";
import { CompactProgress } from "@/components/ProgressIndicator";
import { usePageForm } from "@/context/PageFormContext";
import { cn } from "@/lib/utils";

// =============================================================================
// DYNAMIC STEP RENDERER
// Renders form steps from the formFlow configuration
// =============================================================================

export function DynamicStepRenderer() {
  const {
    form,
    formFlow,
    currentStep,
    totalSteps,
    currentStepConfig,
    nextStep,
    prevStep,
    isSubmitting,
    isSubmitted,
    submitError,
    submitForm,
  } = usePageForm();

  // Success screen
  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {formFlow.successTitle || "Thank You!"}
        </h2>
        <p className="text-lg text-gray-600">
          {formFlow.successMessage || "We've received your submission."}
        </p>
      </div>
    );
  }

  if (!currentStepConfig) return null;

  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  const handleNext = async () => {
    if (isLastStep) {
      await submitForm();
    } else {
      await nextStep();
    }
  };

  return (
    <AnimatePresence mode="wait">
      <FormStepWrapper stepKey={`step-${currentStep}`}>
        <div className="max-w-xl mx-auto space-y-8">
          {/* Progress bar (hide on first step if single step) */}
          {totalSteps > 1 && !isFirstStep && (
            <CompactProgress currentStep={currentStep} totalSteps={totalSteps} />
          )}

          {/* Back button */}
          {!isFirstStep && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={prevStep}
              className="text-gray-500 hover:text-gray-900 -ml-2"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}

          {/* Step title */}
          <div className="space-y-2">
            <h2 className={cn(
              "font-bold text-gray-900",
              isFirstStep ? "text-3xl sm:text-4xl lg:text-5xl leading-tight" : "text-2xl sm:text-3xl"
            )}>
              {currentStepConfig.title}
            </h2>
            {currentStepConfig.description && (
              <p className="text-lg text-gray-600">
                {currentStepConfig.description}
              </p>
            )}
          </div>

          {/* Render blocks for this step */}
          <div className={cn(
            "space-y-4",
            currentStepConfig.layout === "two-column" && "grid grid-cols-1 sm:grid-cols-2 gap-4 space-y-0"
          )}>
            {currentStepConfig.blocks.map((blockConfig) => (
              <BlockRenderer
                key={blockConfig.id}
                config={blockConfig}
                formContext={form}
                disableAnimations
              />
            ))}
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Action button */}
          <Button
            type="button"
            size="lg"
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-w-[200px] h-14 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : isLastStep ? (
              formFlow.submitButtonText || "Submit"
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {/* Trust indicator on first step */}
          {isFirstStep && totalSteps > 1 && (
            <p className="text-xs text-gray-500 text-center">
              Your information is secure and will never be shared.
            </p>
          )}
        </div>
      </FormStepWrapper>
    </AnimatePresence>
  );
}
