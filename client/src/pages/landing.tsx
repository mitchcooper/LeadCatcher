import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { PageRenderer } from "@/components/blocks/SectionRenderer";
import { AppraisalFormProvider, useAppraisalForm } from "@/context/AppraisalFormContext";
import { PageFormProvider } from "@/context/PageFormContext";
import { FormLayout } from "@/components/FormLayout";
import { Step1Address } from "@/components/form-steps/Step1Address";
import { Step2Relationship } from "@/components/form-steps/Step2Relationship";
import { Step3Timeline } from "@/components/form-steps/Step3Timeline";
import { Step4Contact } from "@/components/form-steps/Step4Contact";
import { DynamicStepRenderer } from "@/components/form-steps/DynamicStepRenderer";
import type { LandingPage, ApiResponse, ThemeConfig, FormFlow, PageType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, AlertCircle } from "lucide-react";

// =============================================================================
// ANALYTICS TRACKING
// =============================================================================

function useAnalyticsTracking(pageId: string | undefined) {
  const trackEvent = useMutation({
    mutationFn: async (data: {
      eventType: string;
      eventData?: Record<string, unknown>;
      stepNumber?: number;
    }) => {
      if (!pageId) return;

      const sessionId = getOrCreateSessionId();
      return apiRequest("/api/analytics/track", {
        method: "POST",
        body: JSON.stringify({
          landingPageId: pageId,
          sessionId,
          ...data,
        }),
      });
    },
  });

  return trackEvent.mutate;
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem("leads_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("leads_session_id", sessionId);
  }
  return sessionId;
}

// =============================================================================
// THEME INJECTION
// =============================================================================

function sanitizeCssValue(value: string): string {
  return value.replace(/[{}<>]/g, "").replace(/\/\*/g, "").replace(/\*\//g, "");
}

function ThemeStyle({ config }: { config?: ThemeConfig }) {
  if (!config) return null;

  const cssVars = Object.entries(config)
    .filter(([, value]) => value)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `--${cssKey}: ${sanitizeCssValue(String(value))};`;
    })
    .join("\n");

  if (!cssVars) return null;

  return (
    <style>
      {`:root { ${cssVars} }`}
    </style>
  );
}

// =============================================================================
// DETERMINE IF PAGE USES DYNAMIC FORM FLOW
// =============================================================================

function hasDynamicFormFlow(page: LandingPage): boolean {
  const formFlow = page.formFlow as FormFlow | undefined;
  // Use dynamic flow if formFlow has steps configured
  return !!(formFlow && formFlow.steps && formFlow.steps.length > 0);
}

// =============================================================================
// DYNAMIC FORM CONTENT (new system - for all page types with formFlow)
// =============================================================================

function DynamicFormContent({ page }: { page: LandingPage }) {
  const trackEvent = useAnalyticsTracking(page.id);

  useEffect(() => {
    trackEvent({ eventType: "page_view" });
  }, [trackEvent]);

  const sections = page.sections || [];

  return (
    <div className="min-h-screen">
      {/* Render content sections */}
      {sections.length > 0 && (
        <PageRenderer sections={sections} />
      )}

      {/* Dynamic form */}
      <div className="py-12 px-4">
        <DynamicStepRenderer />
      </div>
    </div>
  );
}

// =============================================================================
// LEGACY APPRAISAL CONTENT (backward compatibility for existing pages)
// =============================================================================

function LegacyAppraisalContent({ page }: { page: LandingPage }) {
  const { currentStep, totalSteps } = useAppraisalForm();
  const trackEvent = useAnalyticsTracking(page.id);

  useEffect(() => {
    trackEvent({ eventType: "page_view" });
  }, [trackEvent]);

  useEffect(() => {
    if (currentStep > 1) {
      trackEvent({ eventType: "step_complete", stepNumber: currentStep - 1 });
    }
  }, [currentStep, trackEvent]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Address />;
      case 2:
        return <Step2Relationship />;
      case 3:
        return <Step3Timeline />;
      case 4:
        return <Step4Contact />;
      default:
        return null;
    }
  };

  const sections = page.sections || [];
  const formSectionIndex = sections.findIndex(
    (s) => s.name?.toLowerCase().includes("form") || s.id === "form"
  );

  const sectionsBeforeForm = formSectionIndex >= 0 ? sections.slice(0, formSectionIndex) : sections;
  const sectionsAfterForm = formSectionIndex >= 0 ? sections.slice(formSectionIndex + 1) : [];

  // Success state
  if (currentStep > totalSteps) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto text-center p-8 bg-white rounded-2xl shadow-xl"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            We've received your appraisal request. One of our team members will be in touch with you shortly.
          </p>
          <p className="text-sm text-gray-500">
            Check your email for a confirmation message.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {sectionsBeforeForm.length > 0 && (
        <PageRenderer sections={sectionsBeforeForm} />
      )}

      <FormLayout>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </FormLayout>

      {sectionsAfterForm.length > 0 && (
        <PageRenderer sections={sectionsAfterForm} />
      )}
    </div>
  );
}

// =============================================================================
// LANDING PAGE WRAPPER (chooses between dynamic and legacy rendering)
// =============================================================================

function LandingPageContent({ page }: { page: LandingPage }) {
  const useDynamic = hasDynamicFormFlow(page);

  if (useDynamic) {
    const formFlow = page.formFlow as FormFlow;
    const pageType = (page.pageType || "appraisal") as PageType;

    return (
      <PageFormProvider
        formFlow={formFlow}
        pageType={pageType}
        landingPageId={page.id}
      >
        <DynamicFormContent page={page} />
      </PageFormProvider>
    );
  }

  // Legacy: use hardcoded appraisal flow
  return (
    <AppraisalFormProvider>
      <LegacyAppraisalContent page={page} />
    </AppraisalFormProvider>
  );
}

// =============================================================================
// LOADING / ERROR STATES
// =============================================================================

function LandingPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Loading page...</p>
      </div>
    </div>
  );
}

function LandingPageError({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN LANDING PAGE COMPONENT
// =============================================================================

export default function LandingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data, isLoading, error } = useQuery<ApiResponse<LandingPage>>({
    queryKey: [`/api/pages/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return <LandingPageLoader />;
  }

  if (error || !data?.success || !data?.data) {
    return <LandingPageError message="This page doesn't exist or is no longer available." />;
  }

  const page = data.data;

  return (
    <>
      <ThemeStyle config={page.themeConfig ?? undefined} />
      <LandingPageContent page={page} />
    </>
  );
}

// =============================================================================
// PREVIEW PAGE COMPONENT (for admin preview of drafts)
// =============================================================================

export function PreviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data, isLoading, error } = useQuery<ApiResponse<LandingPage>>({
    queryKey: [`/api/admin/preview/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return <LandingPageLoader />;
  }

  if (error || !data?.success || !data?.data) {
    return <LandingPageError message="This page doesn't exist." />;
  }

  const page = data.data;

  return (
    <>
      {/* Preview banner */}
      <div className="bg-yellow-500 text-yellow-900 text-center py-2 px-4 text-sm font-medium">
        Preview Mode {page.status === "draft" && "- This page is not published yet"}
      </div>
      <ThemeStyle config={page.themeConfig ?? undefined} />
      <LandingPageContent page={page} />
    </>
  );
}
