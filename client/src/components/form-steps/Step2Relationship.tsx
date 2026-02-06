import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioCardsBlock } from "@/components/blocks/form/RadioCardsBlock";
import { FormStepWrapper } from "./FormStepWrapper";
import { CompactProgress } from "@/components/ProgressIndicator";
import { useAppraisalForm } from "@/context/AppraisalFormContext";

// =============================================================================
// RELATIONSHIP OPTIONS
// =============================================================================

const relationshipOptions = [
  {
    value: "owner",
    label: "Owner Occupier",
    description: "I live in this property",
    icon: "Home",
  },
  {
    value: "investor",
    label: "Investor Owner",
    description: "I own but don't live here",
    icon: "Building",
  },
  {
    value: "buyer",
    label: "Potential Buyer",
    description: "I'm looking to buy",
    icon: "Key",
  },
  {
    value: "tenant",
    label: "Tenant",
    description: "I'm renting this property",
    icon: "ClipboardList",
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

interface Step2RelationshipProps {
  headline?: string;
}

export function Step2Relationship({
  headline = "What's your relationship to this property?",
}: Step2RelationshipProps) {
  const { form, nextStep, prevStep, currentStep, totalSteps } = useAppraisalForm();

  // Listen for radio card selection to auto-advance
  useEffect(() => {
    const handleRadioSelect = (event: CustomEvent<{ fieldName: string; value: string }>) => {
      if (event.detail.fieldName === "relationship") {
        // Small delay for visual feedback
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
    <FormStepWrapper stepKey="step-2">
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

        {/* Radio cards */}
        <RadioCardsBlock
          id="relationship-cards"
          config={{
            id: "relationship-cards",
            type: "radio-cards",
            props: {},
          }}
          props={{
            fieldName: "relationship",
            options: relationshipOptions,
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
