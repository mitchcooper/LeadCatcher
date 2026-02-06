import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextInputBlock } from "@/components/blocks/form/TextInputBlock";
import { EmailInputBlock } from "@/components/blocks/form/EmailInputBlock";
import { PhoneInputBlock } from "@/components/blocks/form/PhoneInputBlock";
import { CheckboxBlock } from "@/components/blocks/form/CheckboxBlock";
import { FormStepWrapper } from "./FormStepWrapper";
import { CompactProgress } from "@/components/ProgressIndicator";
import { useAppraisalForm } from "@/context/AppraisalFormContext";

// =============================================================================
// COMPONENT
// =============================================================================

interface Step4ContactProps {
  headline?: string;
  buttonText?: string;
  privacyText?: string;
  privacyLinkText?: string;
  privacyLinkUrl?: string;
}

export function Step4Contact({
  headline = "Almost there! Where should we send your appraisal?",
  buttonText = "Get My Free Appraisal",
  privacyText = "I agree to the privacy policy and consent to being contacted about my property appraisal.",
  privacyLinkText = "privacy policy",
  privacyLinkUrl = "/privacy",
}: Step4ContactProps) {
  const {
    form,
    prevStep,
    currentStep,
    totalSteps,
    isSubmitting,
    submitError,
    submitForm,
  } = useAppraisalForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <FormStepWrapper stepKey="step-4">
      <form onSubmit={handleSubmit} className="space-y-8">
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

        {/* Name fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInputBlock
            id="first-name"
            config={{ id: "first-name", type: "text-input", props: {} }}
            props={{
              label: "First Name",
              placeholder: "John",
              required: true,
              fieldName: "firstName",
              autoComplete: "given-name",
            }}
            formContext={form}
          />
          <TextInputBlock
            id="last-name"
            config={{ id: "last-name", type: "text-input", props: {} }}
            props={{
              label: "Last Name",
              placeholder: "Smith",
              required: true,
              fieldName: "lastName",
              autoComplete: "family-name",
            }}
            formContext={form}
          />
        </div>

        {/* Contact fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EmailInputBlock
            id="email"
            config={{ id: "email", type: "email-input", props: {} }}
            props={{
              label: "Email Address",
              placeholder: "john@example.com",
              required: true,
              fieldName: "email",
            }}
            formContext={form}
          />
          <PhoneInputBlock
            id="phone"
            config={{ id: "phone", type: "phone-input", props: {} }}
            props={{
              label: "Phone Number",
              placeholder: "021 123 4567",
              required: true,
              fieldName: "phone",
            }}
            formContext={form}
          />
        </div>

        {/* Privacy consent */}
        <CheckboxBlock
          id="consent"
          config={{ id: "consent", type: "checkbox", props: {} }}
          props={{
            label: privacyText,
            required: true,
            fieldName: "consent",
            linkText: privacyLinkText,
            linkUrl: privacyLinkUrl,
          }}
          formContext={form}
        />

        {/* Submit error */}
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full h-14 text-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            buttonText
          )}
        </Button>

        {/* Security note */}
        <p className="text-xs text-gray-500 text-center">
          Your information is secure and will only be used to provide your property appraisal.
        </p>
      </form>
    </FormStepWrapper>
  );
}
