import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddressFinderBlock } from "@/components/blocks/form/AddressFinderBlock";
import { FormStepWrapper } from "./FormStepWrapper";
import { useAppraisalForm } from "@/context/AppraisalFormContext";
import type { AddressFinderResult } from "@/lib/addressfinder";

// =============================================================================
// PROPS
// =============================================================================

interface Step1AddressProps {
  headline?: string;
  subheadline?: string;
  buttonText?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Step1Address({
  headline = "What's Your Home Worth in Today's Market?",
  subheadline = "Get a free, no-obligation property appraisal from a local expert.",
  buttonText = "Get Started",
}: Step1AddressProps) {
  const { form, nextStep, canGoNext } = useAppraisalForm();

  // Listen for address selection events
  useEffect(() => {
    const handleAddressSelect = (event: CustomEvent<AddressFinderResult>) => {
      const { fullAddress, components, coordinates } = event.detail;

      form.setValue("addressFull", fullAddress, { shouldValidate: true });
      form.setValue("addressComponents", components, { shouldValidate: true });
      form.setValue("coordinates", coordinates, { shouldValidate: true });
      form.setValue("suburb", components.suburb, { shouldValidate: true });
    };

    window.addEventListener("addressSelected", handleAddressSelect as EventListener);

    return () => {
      window.removeEventListener("addressSelected", handleAddressSelect as EventListener);
    };
  }, [form]);

  const handleContinue = async () => {
    await nextStep();
  };

  return (
    <FormStepWrapper stepKey="step-1">
      <div className="max-w-xl mx-auto text-center space-y-8">
        {/* Headline */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            {headline}
          </h1>
          <p className="text-lg text-gray-600">
            {subheadline}
          </p>
        </div>

        {/* Address finder */}
        <div className="text-left">
          <AddressFinderBlock
            id="address-finder-step1"
            config={{
              id: "address-finder-step1",
              type: "address-finder",
              props: {},
            }}
            props={{
              label: "",
              placeholder: "Start typing your property address...",
              helperText: "",
              required: true,
              fieldName: "addressFull",
            }}
            formContext={form}
          />
        </div>

        {/* Continue button */}
        <Button
          type="button"
          size="lg"
          onClick={handleContinue}
          disabled={!canGoNext}
          className="w-full sm:w-auto min-w-[200px] h-14 text-lg"
        >
          {buttonText}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free, no-obligation</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Delivered within 24 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Local suburb expert</span>
          </div>
        </div>
      </div>
    </FormStepWrapper>
  );
}
