import { useCallback, useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";

// =============================================================================
// TYPES
// =============================================================================

export type EventType =
  | "page_view"
  | "form_start"
  | "step_complete"
  | "form_submit"
  | "cta_click";

interface TrackEventOptions {
  landingPageId?: string;
  eventType: EventType;
  eventData?: Record<string, unknown>;
  stepNumber?: number;
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

function getSessionId(): string {
  const key = "leads_analytics_session";
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

// =============================================================================
// ANALYTICS HOOK
// =============================================================================

export function useAnalytics(landingPageId?: string) {
  const sessionId = useRef(getSessionId());
  const trackedEvents = useRef(new Set<string>());

  // Track an event
  const trackEvent = useCallback(
    async (options: Omit<TrackEventOptions, "landingPageId">) => {
      // Create a unique key for deduplication
      const eventKey = `${options.eventType}-${options.stepNumber || "na"}`;

      // Don't track duplicate events in the same session
      if (trackedEvents.current.has(eventKey)) {
        return;
      }

      try {
        await apiRequest("/api/analytics/track", {
          method: "POST",
          body: JSON.stringify({
            landingPageId,
            sessionId: sessionId.current,
            ...options,
          }),
        });

        trackedEvents.current.add(eventKey);
      } catch (error) {
        // Silently fail analytics - don't affect user experience
        console.warn("Analytics tracking failed:", error);
      }
    },
    [landingPageId]
  );

  // Track page view on mount
  const trackPageView = useCallback(() => {
    trackEvent({ eventType: "page_view" });
  }, [trackEvent]);

  // Track form start
  const trackFormStart = useCallback(() => {
    trackEvent({ eventType: "form_start" });
  }, [trackEvent]);

  // Track step completion
  const trackStepComplete = useCallback(
    (stepNumber: number, stepData?: Record<string, unknown>) => {
      trackEvent({
        eventType: "step_complete",
        stepNumber,
        eventData: stepData,
      });
    },
    [trackEvent]
  );

  // Track form submission
  const trackFormSubmit = useCallback(
    (submitData?: Record<string, unknown>) => {
      trackEvent({
        eventType: "form_submit",
        eventData: submitData,
      });
    },
    [trackEvent]
  );

  // Track CTA click
  const trackCtaClick = useCallback(
    (ctaId: string, ctaText?: string) => {
      trackEvent({
        eventType: "cta_click",
        eventData: { ctaId, ctaText },
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackFormStart,
    trackStepComplete,
    trackFormSubmit,
    trackCtaClick,
    sessionId: sessionId.current,
  };
}

// =============================================================================
// AUTO-TRACK PAGE VIEW HOOK
// =============================================================================

export function useAutoTrackPageView(landingPageId?: string) {
  const { trackPageView } = useAnalytics(landingPageId);

  useEffect(() => {
    if (landingPageId) {
      trackPageView();
    }
  }, [landingPageId, trackPageView]);
}
