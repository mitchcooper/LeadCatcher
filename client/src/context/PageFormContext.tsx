import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import type { FormFlow, FormStep, PageType } from "@shared/schema";

// =============================================================================
// CONTEXT TYPE
// =============================================================================

interface PageFormContextValue {
  // Form state
  form: UseFormReturn<Record<string, any>>;
  formFlow: FormFlow;
  pageType: PageType;

  // Step navigation
  currentStep: number;
  totalSteps: number;
  currentStepConfig: FormStep | undefined;
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  canGoNext: boolean;

  // Submission
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError: string | null;
  submitForm: () => Promise<boolean>;

  // Page metadata
  landingPageId?: string;
}

const PageFormContext = createContext<PageFormContextValue | null>(null);

// =============================================================================
// HOOK
// =============================================================================

export function usePageForm() {
  const context = useContext(PageFormContext);
  if (!context) {
    throw new Error("usePageForm must be used within a PageFormProvider");
  }
  return context;
}

// =============================================================================
// PROVIDER PROPS
// =============================================================================

interface PageFormProviderProps {
  children: ReactNode;
  formFlow: FormFlow;
  pageType: PageType;
  landingPageId?: string;
  onSubmit?: (data: Record<string, any>) => Promise<void>;
}

// =============================================================================
// PROVIDER
// =============================================================================

export function PageFormProvider({
  children,
  formFlow,
  pageType,
  landingPageId,
  onSubmit,
}: PageFormProviderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalSteps = formFlow.steps.length;
  const currentStepConfig = formFlow.steps[currentStep - 1];

  const form = useForm<Record<string, any>>({
    mode: "onTouched",
    defaultValues: {},
  });

  // Validate the current step's required fields
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const step = formFlow.steps[currentStep - 1];
    if (!step) return true;

    // Collect field names from this step's blocks that have required: true
    const requiredFields: string[] = [];
    step.blocks.forEach((block) => {
      const props = block.props as Record<string, unknown>;
      const fieldName = props.fieldName as string | undefined;
      if (fieldName && props.required) {
        requiredFields.push(fieldName);
      }
    });

    if (requiredFields.length === 0) return true;

    // Trigger validation on required fields
    const result = await form.trigger(requiredFields);
    return result;
  }, [currentStep, formFlow.steps, form]);

  const nextStep = useCallback(async (): Promise<boolean> => {
    const isValid = await validateCurrentStep();
    if (!isValid) return false;

    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1);
      return true;
    }
    return false;
  }, [currentStep, totalSteps, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const canGoNext = currentStep < totalSteps;

  const submitForm = useCallback(async (): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validate all fields
      const isValid = await form.trigger();
      if (!isValid) {
        setIsSubmitting(false);
        return false;
      }

      const data = form.getValues();

      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Determine the submission endpoint based on page type
        const endpoint = pageType === "appraisal" ? "/api/appraisals" : "/api/submissions";

        const payload = pageType === "appraisal"
          ? { ...data, landingPageId }
          : {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              pageType,
              landingPageId,
              formData: data,
            };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || "Submission failed");
        }
      }

      setIsSubmitted(true);
      setIsSubmitting(false);
      return true;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
      return false;
    }
  }, [form, onSubmit, pageType, landingPageId]);

  return (
    <PageFormContext.Provider
      value={{
        form,
        formFlow,
        pageType,
        currentStep,
        totalSteps,
        currentStepConfig,
        nextStep,
        prevStep,
        canGoNext,
        isSubmitting,
        isSubmitted,
        submitError,
        submitForm,
        landingPageId,
      }}
    >
      {children}
    </PageFormContext.Provider>
  );
}
