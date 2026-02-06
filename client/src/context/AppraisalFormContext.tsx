import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AddressComponents, Coordinates } from "@shared/schema";

// =============================================================================
// FORM DATA SCHEMA
// =============================================================================

export const appraisalFormSchema = z.object({
  // Step 1: Address
  addressFull: z.string().min(1, "Please select an address"),
  addressComponents: z.object({
    streetNumber: z.string().optional(),
    street: z.string().optional(),
    suburb: z.string(),
    city: z.string(),
    postcode: z.string(),
    region: z.string().optional(),
  }).optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  suburb: z.string().optional(),

  // Step 2: Relationship
  relationship: z.enum(["owner", "investor", "buyer", "tenant", "other"]).optional(),

  // Step 3: Timeline
  timeline: z.enum(["asap", "1-3months", "3-6months", "6-12months", "justlooking"]).optional(),

  // Step 4: Contact
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  consent: z.boolean().refine((val) => val === true, "You must agree to continue"),
});

export type AppraisalFormData = z.infer<typeof appraisalFormSchema>;

// Step-specific validation schemas
const stepSchemas = {
  1: appraisalFormSchema.pick({ addressFull: true }),
  2: appraisalFormSchema.pick({ relationship: true }),
  3: appraisalFormSchema.pick({ timeline: true }),
  4: appraisalFormSchema.pick({ firstName: true, lastName: true, email: true, phone: true, consent: true }),
};

// =============================================================================
// CONTEXT TYPE
// =============================================================================

interface AppraisalFormContextType {
  // Form state
  form: UseFormReturn<AppraisalFormData>;
  formData: Partial<AppraisalFormData>;

  // Step navigation
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  canGoBack: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;

  // Navigation methods
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  goToStep: (step: number) => void;

  // Map coordinates
  mapCoordinates: Coordinates | null;

  // Submission
  isSubmitting: boolean;
  submitError: string | null;
  submitForm: () => Promise<boolean>;

  // Landing page context
  landingPageId?: string;
  setLandingPageId: (id: string) => void;
}

const AppraisalFormContext = createContext<AppraisalFormContextType | null>(null);

// =============================================================================
// PROVIDER
// =============================================================================

interface AppraisalFormProviderProps {
  children: ReactNode;
  initialStep?: number;
  onSubmit?: (data: AppraisalFormData) => Promise<void>;
}

export function AppraisalFormProvider({
  children,
  initialStep = 1,
  onSubmit,
}: AppraisalFormProviderProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [landingPageId, setLandingPageId] = useState<string>();

  const totalSteps = 4;

  // Initialize form with react-hook-form
  const form = useForm<AppraisalFormData>({
    resolver: zodResolver(appraisalFormSchema),
    mode: "onChange",
    defaultValues: {
      addressFull: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      consent: false,
    },
  });

  const formData = form.watch();
  const mapCoordinates = formData.coordinates ?? null;

  // Navigation state
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const canGoBack = currentStep > 1;

  // Check if current step is valid
  const canGoNext = useCallback((): boolean => {
    const stepSchema = stepSchemas[currentStep as keyof typeof stepSchemas];
    if (!stepSchema) return true;

    const result = stepSchema.safeParse(formData);
    return result.success;
  }, [currentStep, formData]);

  // Navigate to next step
  const nextStep = useCallback(async (): Promise<boolean> => {
    const stepSchema = stepSchemas[currentStep as keyof typeof stepSchemas];

    if (stepSchema) {
      // Validate current step fields
      const fieldsToValidate = Object.keys(stepSchema.shape) as (keyof AppraisalFormData)[];
      const isValid = await form.trigger(fieldsToValidate);

      if (!isValid) {
        return false;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      return true;
    }

    return false;
  }, [currentStep, form, totalSteps]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // Go to specific step
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  // Submit the form
  const submitForm = useCallback(async (): Promise<boolean> => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Validate all fields
      const isValid = await form.trigger();
      if (!isValid) {
        setIsSubmitting(false);
        return false;
      }

      const data = form.getValues();

      // Call the onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default: POST to /api/appraisals
        const response = await fetch("/api/appraisals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            landingPageId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to submit form");
        }
      }

      setIsSubmitting(false);
      return true;
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError(error instanceof Error ? error.message : "An error occurred");
      setIsSubmitting(false);
      return false;
    }
  }, [form, onSubmit, landingPageId]);

  const value: AppraisalFormContextType = {
    form,
    formData,
    currentStep,
    totalSteps,
    canGoNext: canGoNext(),
    canGoBack,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
    mapCoordinates,
    isSubmitting,
    submitError,
    submitForm,
    landingPageId,
    setLandingPageId,
  };

  return (
    <AppraisalFormContext.Provider value={value}>
      {children}
    </AppraisalFormContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useAppraisalForm() {
  const context = useContext(AppraisalFormContext);
  if (!context) {
    throw new Error("useAppraisalForm must be used within AppraisalFormProvider");
  }
  return context;
}
