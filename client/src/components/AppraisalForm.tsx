import { AnimatePresence } from "framer-motion";
import { AppraisalFormProvider, useAppraisalForm } from "@/context/AppraisalFormContext";
import { FormLayout } from "./FormLayout";
import {
  Step1Address,
  Step2Relationship,
  Step3Timeline,
  Step4Contact,
} from "./form-steps";
import { cn } from "@/lib/utils";

// =============================================================================
// FORM CONTENT (uses context)
// =============================================================================

function AppraisalFormContent() {
  const { currentStep } = useAppraisalForm();

  return (
    <FormLayout>
      <AnimatePresence mode="wait">
        {currentStep === 1 && <Step1Address key="step-1" />}
        {currentStep === 2 && <Step2Relationship key="step-2" />}
        {currentStep === 3 && <Step3Timeline key="step-3" />}
        {currentStep === 4 && <Step4Contact key="step-4" />}
      </AnimatePresence>
    </FormLayout>
  );
}

// =============================================================================
// SUCCESS SCREEN
// =============================================================================

interface SuccessScreenProps {
  firstName?: string;
}

function SuccessScreen({ firstName }: SuccessScreenProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        {/* Success icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Thanks{firstName ? `, ${firstName}` : ""}!
          </h2>
          <p className="text-gray-600">
            Your appraisal request has been received. We'll be in touch within 24 hours.
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-gray-50 rounded-xl p-6 text-left space-y-4">
          <h3 className="font-semibold text-gray-900">What happens next?</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                1
              </span>
              <span className="text-gray-600">We review your property details</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                2
              </span>
              <span className="text-gray-600">Our agent will call to arrange a visit</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                3
              </span>
              <span className="text-gray-600">You'll receive your detailed appraisal</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface AppraisalFormProps {
  landingPageId?: string;
  onSuccess?: () => void;
  className?: string;
}

export function AppraisalForm({
  landingPageId,
  onSuccess,
  className,
}: AppraisalFormProps) {
  return (
    <div className={cn("w-full", className)}>
      <AppraisalFormProvider>
        <AppraisalFormContent />
      </AppraisalFormProvider>
    </div>
  );
}

// Export success screen for use in thank you page
export { SuccessScreen };
