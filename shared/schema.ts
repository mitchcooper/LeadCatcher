import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =============================================================================
// LANDING PAGES TABLE
// =============================================================================

export const leadsLandingPages = pgTable("leads_landing_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft, published, archived

  // Page type determines form behavior and submission handling
  pageType: varchar("page_type", { length: 32 }).notNull().default("appraisal"),
  // appraisal | lead_magnet | newsletter | webinar | inquiry | custom

  // SEO metadata
  metaTitle: varchar("meta_title", { length: 256 }),
  metaDescription: text("meta_description"),
  ogImageUrl: varchar("og_image_url", { length: 512 }),

  // Theme configuration
  themeConfig: jsonb("theme_config").default({}).$type<ThemeConfig>(),

  // Page content (block-based sections)
  sections: jsonb("sections").notNull().default([]).$type<PageSection[]>(),

  // Form flow configuration
  formFlow: jsonb("form_flow").notNull().default({}).$type<FormFlow>(),

  // Settings
  isDefault: boolean("is_default").default(false),
  publishedAt: timestamp("published_at"),

  // Analytics counters (denormalized for performance)
  views: integer("views").default(0),
  submissions: integer("submissions").default(0),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("leads_landing_pages_slug_idx").on(table.slug),
  statusIdx: index("leads_landing_pages_status_idx").on(table.status),
}));

// Note: Using inferred types directly due to complex JSONB recursive types
export type InsertLandingPage = typeof leadsLandingPages.$inferInsert;
export type LandingPage = typeof leadsLandingPages.$inferSelect;

// =============================================================================
// PROPERTY APPRAISALS (LEADS) TABLE
// =============================================================================

export const leadsPropertyAppraisals = pgTable("leads_property_appraisals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Source tracking
  landingPageId: varchar("landing_page_id").references(() => leadsLandingPages.id),

  // Address data
  addressFull: text("address_full").notNull(),
  addressComponents: jsonb("address_components").$type<AddressComponents>(),
  coordinates: jsonb("coordinates").$type<Coordinates>(),

  // Form responses
  relationship: varchar("relationship", { length: 32 }), // owner, investor, buyer, tenant, other
  timeline: varchar("timeline", { length: 32 }), // asap, 1-3months, 3-6months, 6-12months, justlooking

  // Contact information
  firstName: varchar("first_name", { length: 64 }).notNull(),
  lastName: varchar("last_name", { length: 64 }).notNull(),
  email: varchar("email", { length: 120 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),

  // Additional form data (flexible)
  formData: jsonb("form_data").default({}).$type<Record<string, unknown>>(),

  // UTM tracking
  utmSource: varchar("utm_source", { length: 128 }),
  utmMedium: varchar("utm_medium", { length: 128 }),
  utmCampaign: varchar("utm_campaign", { length: 128 }),
  utmTerm: varchar("utm_term", { length: 128 }),
  utmContent: varchar("utm_content", { length: 128 }),

  // Request metadata
  referrer: varchar("referrer", { length: 512 }),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),

  // Lead status
  status: varchar("status", { length: 20 }).notNull().default("new"), // new, contacted, qualified, converted, lost
  notes: text("notes"),

  // Integration tracking (for future CRM/email webhooks)
  crmSubmitted: boolean("crm_submitted").default(false),
  crmResponse: jsonb("crm_response"),
  emailSent: boolean("email_sent").default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  landingPageIdx: index("leads_appraisals_landing_page_idx").on(table.landingPageId),
  createdAtIdx: index("leads_appraisals_created_at_idx").on(table.createdAt),
  emailIdx: index("leads_appraisals_email_idx").on(table.email),
  statusIdx: index("leads_appraisals_status_idx").on(table.status),
}));

export type InsertPropertyAppraisal = typeof leadsPropertyAppraisals.$inferInsert;
export type PropertyAppraisal = typeof leadsPropertyAppraisals.$inferSelect;

// =============================================================================
// SUBURBS TABLE
// =============================================================================

export const leadsSuburbs = pgTable("leads_suburbs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 64 }).notNull(),
  region: varchar("region", { length: 64 }),
  city: varchar("city", { length: 64 }),

  // Statistics for dynamic content
  homesSoldLastYear: integer("homes_sold_last_year").default(0),
  medianPrice: integer("median_price"),
  averageDaysOnMarket: integer("average_days_on_market"),

  // Custom marketing text
  customText: text("custom_text"),

  // Active status
  isActive: boolean("is_active").default(true),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  nameIdx: index("leads_suburbs_name_idx").on(table.name),
}));

export type InsertSuburb = typeof leadsSuburbs.$inferInsert;
export type Suburb = typeof leadsSuburbs.$inferSelect;

// =============================================================================
// BLOCK TEMPLATES TABLE
// =============================================================================

export const leadsBlockTemplates = pgTable("leads_block_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 128 }).notNull(),
  category: varchar("category", { length: 32 }).notNull(), // form, content, social-proof, layout, conversion
  blockType: varchar("block_type", { length: 64 }).notNull(),
  defaultConfig: jsonb("default_config").notNull().$type<BlockConfig>(),

  // System vs custom templates
  isSystem: boolean("is_system").default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InsertBlockTemplate = typeof leadsBlockTemplates.$inferInsert;
export type BlockTemplate = typeof leadsBlockTemplates.$inferSelect;

// =============================================================================
// ANALYTICS EVENTS TABLE
// =============================================================================

export const leadsAnalyticsEvents = pgTable("leads_analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  landingPageId: varchar("landing_page_id").references(() => leadsLandingPages.id),

  // Session tracking
  sessionId: varchar("session_id", { length: 64 }),

  // Event details
  eventType: varchar("event_type", { length: 64 }).notNull(), // page_view, form_start, step_complete, form_submit, cta_click
  eventData: jsonb("event_data").default({}).$type<Record<string, unknown>>(),

  // Form step tracking
  stepNumber: integer("step_number"),

  // Timestamp
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  landingPageIdx: index("leads_analytics_landing_page_idx").on(table.landingPageId),
  sessionIdx: index("leads_analytics_session_idx").on(table.sessionId),
  eventTypeIdx: index("leads_analytics_event_type_idx").on(table.eventType),
  createdAtIdx: index("leads_analytics_created_at_idx").on(table.createdAt),
}));

export type InsertAnalyticsEvent = typeof leadsAnalyticsEvents.$inferInsert;
export type AnalyticsEvent = typeof leadsAnalyticsEvents.$inferSelect;

// =============================================================================
// FORM SUBMISSIONS TABLE (generic, for non-appraisal page types)
// =============================================================================

export const leadsFormSubmissions = pgTable("leads_form_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Source tracking
  landingPageId: varchar("landing_page_id").references(() => leadsLandingPages.id),
  pageType: varchar("page_type", { length: 32 }).notNull(),

  // Common contact fields (extracted from formData for querying)
  email: varchar("email", { length: 120 }).notNull(),
  firstName: varchar("first_name", { length: 64 }),
  lastName: varchar("last_name", { length: 64 }),
  phone: varchar("phone", { length: 20 }),

  // All form data (flexible JSONB)
  formData: jsonb("form_data").default({}).$type<Record<string, unknown>>(),

  // UTM tracking
  utmSource: varchar("utm_source", { length: 128 }),
  utmMedium: varchar("utm_medium", { length: 128 }),
  utmCampaign: varchar("utm_campaign", { length: 128 }),

  // Request metadata
  referrer: varchar("referrer", { length: 512 }),
  ipAddress: varchar("ip_address", { length: 45 }),

  // Lead status
  status: varchar("status", { length: 20 }).notNull().default("new"),
  notes: text("notes"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  landingPageIdx: index("leads_form_subs_landing_page_idx").on(table.landingPageId),
  pageTypeIdx: index("leads_form_subs_page_type_idx").on(table.pageType),
  emailIdx: index("leads_form_subs_email_idx").on(table.email),
  createdAtIdx: index("leads_form_subs_created_at_idx").on(table.createdAt),
}));

export type InsertFormSubmission = typeof leadsFormSubmissions.$inferInsert;
export type FormSubmission = typeof leadsFormSubmissions.$inferSelect;

// =============================================================================
// TYPE DEFINITIONS FOR JSONB COLUMNS
// =============================================================================

// Theme configuration
export interface ThemeConfig {
  primaryColor?: string;
  primaryHover?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  textMutedColor?: string;
  borderColor?: string;
  successColor?: string;
  errorColor?: string;
  fontFamily?: string;
  headingFontFamily?: string;
  borderRadius?: string;
  borderRadiusLg?: string;
}

// Address components from AddressFinder
export interface AddressComponents {
  streetNumber?: string;
  street?: string;
  suburb: string;
  city: string;
  postcode: string;
  region?: string;
}

// Coordinates
export interface Coordinates {
  lat: number;
  lng: number;
}

// Block configuration
export interface BlockConfig {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: BlockConfig[];
  visibility?: {
    desktop: boolean;
    tablet: boolean;
    mobile: boolean;
  };
  animation?: {
    entrance: "none" | "fadeIn" | "slideUp" | "slideDown" | "scaleIn";
    delay?: number;
    duration?: number;
  };
}

// Page section
export interface PageSection {
  id: string;
  name?: string;
  blocks: BlockConfig[];
  background?: {
    type: "color" | "gradient" | "image";
    value: string;
  };
  padding?: {
    top: string;
    bottom: string;
  };
}

// Page types
export const PAGE_TYPES = [
  "appraisal",
  "lead_magnet",
  "newsletter",
  "webinar",
  "inquiry",
  "custom",
] as const;
export type PageType = typeof PAGE_TYPES[number];

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  appraisal: "Property Appraisal",
  lead_magnet: "Lead Magnet / Download",
  newsletter: "Newsletter Signup",
  webinar: "Webinar / Event Registration",
  inquiry: "Property Management Inquiry",
  custom: "Custom Form",
};

// Form step definition
export interface FormStep {
  id: string;
  title: string;
  description?: string;
  blocks: BlockConfig[]; // Inline block configs for this step
  layout?: "single" | "two-column"; // Layout variant for the step
}

// Form flow configuration
export interface FormFlow {
  steps: FormStep[];
  submitButtonText?: string;
  successTitle?: string;
  successMessage?: string;
  submitAction?: {
    webhookUrl?: string;
    emailTo?: string;
    redirectUrl?: string;
  };
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
