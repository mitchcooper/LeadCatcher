import { z } from "zod";

// =============================================================================
// FORM SUBMISSION VALIDATION
// =============================================================================

// Lead/Appraisal form submission schema
export const appraisalSubmissionSchema = z.object({
  // Address (required)
  addressFull: z.string().min(1, "Address is required"),
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

  // Form responses
  relationship: z.enum(["owner", "investor", "buyer", "tenant", "other"]).optional(),
  timeline: z.enum(["asap", "1-3months", "3-6months", "6-12months", "justlooking"]).optional(),

  // Contact information (required)
  firstName: z.string().min(1, "First name is required").max(64),
  lastName: z.string().min(1, "Last name is required").max(64),
  email: z.string().email("Invalid email address").max(120),
  phone: z.string().min(1, "Phone number is required").max(20),

  // Additional form data
  formData: z.record(z.unknown()).optional(),

  // Source tracking
  landingPageId: z.string().optional(),

  // UTM parameters (captured automatically)
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  referrer: z.string().optional(),
});

export type AppraisalSubmission = z.infer<typeof appraisalSubmissionSchema>;

// =============================================================================
// LANDING PAGE VALIDATION
// =============================================================================

export const createLandingPageSchema = z.object({
  slug: z.string()
    .min(1, "Slug is required")
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  name: z.string().min(1, "Name is required").max(128),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  metaTitle: z.string().max(256).optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url().optional().or(z.literal("")),
  themeConfig: z.record(z.unknown()).optional(),
  sections: z.array(z.unknown()).optional(),
  formFlow: z.record(z.unknown()).optional(),
  isDefault: z.boolean().optional(),
});

export type CreateLandingPage = z.infer<typeof createLandingPageSchema>;

export const updateLandingPageSchema = createLandingPageSchema.partial();

export type UpdateLandingPage = z.infer<typeof updateLandingPageSchema>;

// =============================================================================
// SUBURB VALIDATION
// =============================================================================

export const createSuburbSchema = z.object({
  name: z.string().min(1, "Name is required").max(64),
  region: z.string().max(64).optional(),
  city: z.string().max(64).optional(),
  homesSoldLastYear: z.number().int().min(0).optional(),
  medianPrice: z.number().int().min(0).optional(),
  averageDaysOnMarket: z.number().int().min(0).optional(),
  customText: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateSuburb = z.infer<typeof createSuburbSchema>;

export const updateSuburbSchema = createSuburbSchema.partial();

export type UpdateSuburb = z.infer<typeof updateSuburbSchema>;

// =============================================================================
// ANALYTICS EVENT VALIDATION
// =============================================================================

export const analyticsEventSchema = z.object({
  landingPageId: z.string().optional(),
  sessionId: z.string().max(64).optional(),
  eventType: z.enum([
    "page_view",
    "form_start",
    "step_complete",
    "form_submit",
    "cta_click",
  ]),
  eventData: z.record(z.unknown()).optional(),
  stepNumber: z.number().int().min(1).max(10).optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;

// =============================================================================
// BLOCK TEMPLATE VALIDATION
// =============================================================================

export const createBlockTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(128),
  category: z.enum(["form", "content", "social-proof", "layout", "conversion"]),
  blockType: z.string().min(1).max(64),
  defaultConfig: z.object({
    id: z.string(),
    type: z.string(),
    props: z.record(z.unknown()),
    children: z.array(z.unknown()).optional(),
    visibility: z.object({
      desktop: z.boolean(),
      tablet: z.boolean(),
      mobile: z.boolean(),
    }).optional(),
    animation: z.object({
      entrance: z.enum(["none", "fadeIn", "slideUp", "slideDown", "scaleIn"]),
      delay: z.number().optional(),
      duration: z.number().optional(),
    }).optional(),
  }),
  isSystem: z.boolean().optional(),
});

export type CreateBlockTemplate = z.infer<typeof createBlockTemplateSchema>;

// =============================================================================
// QUERY PARAMETER VALIDATION
// =============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export const leadFilterSchema = z.object({
  status: z.enum(["new", "contacted", "qualified", "converted", "lost"]).optional(),
  landingPageId: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type LeadFilters = z.infer<typeof leadFilterSchema>;
