import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioCardsBlock } from "@/components/blocks/form/RadioCardsBlock";
import { FormStepWrapper } from "./FormStepWrapper";
import { CompactProgress } from "@/components/ProgressIndicator";
import { useAppraisalForm } from "@/context/AppraisalFormContext";

// =============================================================================
// TIMELINE OPTIONS
// =============================================================================

const timelineOptions = [
  {
    value: "asap",
    label: "As soon as possible",
    description: "Ready to move now",
    icon: "Zap",
  },
  {
    value: "1-3months",
    label: "1-3 months",
    description: "Planning to list soon",
    icon: "Calendar",
  },
  {
    value: "3-6months",
    label: "3-6 months",
    description: "Getting prepared",
    icon: "CalendarDays",
  },
  {
    value: "justlooking",
    label: "Just curious",
    description: "No immediate plans",
    icon: "HelpCircle",
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

interface Step3TimelineProps {
  headline?: string;
}

export function Step3Timeline({
  headline = "When are you thinking of selling?",
}: Step3TimelineProps) {
  const { form, nextStep, prevStep, currentStep, totalSteps, formData } = useAppraisalForm();

  // Dynamic suburb message
  const suburb = formData.suburb || formData.addressComponents?.suburb;

  // Listen for radio card selection to auto-advance
  useEffect(() => {
    const handleRadioSelect = (event: CustomEvent<{ fieldName: string; value: string }>) => {
      if (event.detail.fieldName === "timeline") {
        setTimeout(() => {
          nextStep();
        }, 300);
      }
    };

    window.addEventListener("radioCardSelected", handleRadioSelect as EventListener);

    return () => {
      window.removeEventListener("radioCardSelected", handleRadioSelect as EventListener);
    };
  }, [nextStep]);

  return (
    <FormStepWrapper stepKey="step-3">
      <div className="space-y-8">
        {/* Progress */}
        <CompactProgress currentStep={currentStep} totalSteps={totalSteps} />

        {/* Back button */}
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

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {headline}
        </h2>

        {/* Suburb-specific message */}
        {suburb && (
          <p className="text-gray-600 bg-primary/5 px-4 py-3 rounded-lg border border-primary/10">
            We've helped many homeowners in <span className="font-medium text-primary">{suburb}</span> get
            great results. Let us know your timeline so we can best assist you.
          </p>
        )}

        {/* Radio cards */}
        <RadioCardsBlock
          id="timeline-cards"
          config={{
            id: "timeline-cards",
            type: "radio-cards",
            props: {},
          }}
          props={{
            fieldName: "timeline",
            options: timelineOptions,
            columns: 2,
            required: true,
            autoAdvance: true,
          }}
          formContext={form}
        />
      </div>
    </FormStepWrapper>
  );
}
