import type { PageType, PageSection, FormFlow, ThemeConfig } from "./schema";

// =============================================================================
// PAGE TEMPLATE DEFINITION
// =============================================================================

export interface PageTemplate {
  pageType: PageType;
  name: string;
  description: string;
  defaultSlugPrefix: string;
  sections: PageSection[];
  formFlow: FormFlow;
  themeConfig?: ThemeConfig;
}

// =============================================================================
// HELPER: Generate unique block IDs
// =============================================================================

let idCounter = 0;
function blockId(type: string): string {
  return `${type}-tpl-${++idCounter}`;
}

// Reset counter for each template generation call
function resetIds() {
  idCounter = 0;
}

// =============================================================================
// PROPERTY APPRAISAL TEMPLATE
// =============================================================================

function createAppraisalTemplate(): PageTemplate {
  resetIds();
  const heroId = blockId("hero-image");
  const headlineId = blockId("headline");
  const statsId = blockId("stats-bar");
  const trustId = blockId("trust-badges");

  return {
    pageType: "appraisal",
    name: "Property Appraisal",
    description: "Multi-step property appraisal request form with address finder, relationship, timeline, and contact details.",
    defaultSlugPrefix: "appraisal",
    sections: [
      {
        id: "hero",
        name: "Hero",
        blocks: [
          {
            id: heroId,
            type: "hero-image",
            props: {
              imageUrl: "",
              overlayOpacity: 0.4,
              height: "300px",
            },
          },
        ],
      },
      {
        id: "social-proof",
        name: "Social Proof",
        blocks: [
          {
            id: statsId,
            type: "stats-bar",
            props: {
              stats: [
                { label: "Properties Appraised", value: "2,500+" },
                { label: "Years Experience", value: "15+" },
                { label: "Happy Clients", value: "98%" },
              ],
            },
          },
        ],
      },
      {
        id: "trust",
        name: "Trust",
        blocks: [
          {
            id: trustId,
            type: "trust-badges",
            props: {
              badges: [
                { text: "Free, no-obligation" },
                { text: "Delivered within 24 hours" },
                { text: "Local suburb expert" },
              ],
            },
          },
        ],
      },
    ],
    formFlow: {
      steps: [
        {
          id: "address",
          title: "What's Your Home Worth in Today's Market?",
          description: "Get a free, no-obligation property appraisal from a local expert.",
          blocks: [
            {
              id: blockId("address-finder"),
              type: "address-finder",
              props: {
                label: "",
                placeholder: "Start typing your property address...",
                required: true,
                fieldName: "addressFull",
              },
            },
          ],
        },
        {
          id: "relationship",
          title: "What's your relationship to this property?",
          blocks: [
            {
              id: blockId("radio-cards"),
              type: "radio-cards",
              props: {
                fieldName: "relationship",
                columns: 2,
                required: true,
                autoAdvance: true,
                options: [
                  { value: "owner", label: "Owner Occupier", description: "I live in this property", icon: "Home" },
                  { value: "investor", label: "Investor Owner", description: "I own but don't live here", icon: "Building" },
                  { value: "buyer", label: "Potential Buyer", description: "I'm looking to buy", icon: "Key" },
                  { value: "tenant", label: "Tenant", description: "I'm renting this property", icon: "ClipboardList" },
                ],
              },
            },
          ],
        },
        {
          id: "timeline",
          title: "When are you thinking of selling?",
          blocks: [
            {
              id: blockId("radio-cards"),
              type: "radio-cards",
              props: {
                fieldName: "timeline",
                columns: 2,
                required: true,
                autoAdvance: true,
                options: [
                  { value: "asap", label: "As soon as possible", description: "Ready to move now", icon: "Zap" },
                  { value: "1-3months", label: "1-3 months", description: "Planning to list soon", icon: "Calendar" },
                  { value: "3-6months", label: "3-6 months", description: "Getting prepared", icon: "CalendarDays" },
                  { value: "justlooking", label: "Just curious", description: "No immediate plans", icon: "HelpCircle" },
                ],
              },
            },
          ],
        },
        {
          id: "contact",
          title: "Almost there! Where should we send your appraisal?",
          layout: "two-column",
          blocks: [
            {
              id: blockId("text-input"),
              type: "text-input",
              props: { label: "First Name", placeholder: "John", required: true, fieldName: "firstName" },
            },
            {
              id: blockId("text-input"),
              type: "text-input",
              props: { label: "Last Name", placeholder: "Smith", required: true, fieldName: "lastName" },
            },
            {
              id: blockId("email-input"),
              type: "email-input",
              props: { label: "Email Address", placeholder: "john@example.com", required: true, fieldName: "email" },
            },
            {
              id: blockId("phone-input"),
              type: "phone-input",
              props: { label: "Phone Number", placeholder: "021 123 4567", required: true, fieldName: "phone" },
            },
            {
              id: blockId("checkbox"),
              type: "checkbox",
              props: {
                label: "I agree to the privacy policy and consent to being contacted about my property appraisal.",
                required: true,
                fieldName: "consent",
                linkText: "privacy policy",
                linkUrl: "/privacy",
              },
            },
          ],
        },
      ],
      submitButtonText: "Get My Free Appraisal",
      successTitle: "Thank You!",
      successMessage: "We'll be in touch within 24 hours with your property appraisal.",
    },
  };
}

// =============================================================================
// LEAD MAGNET / DOWNLOAD TEMPLATE
// =============================================================================

function createLeadMagnetTemplate(): PageTemplate {
  resetIds();

  return {
    pageType: "lead_magnet",
    name: "Lead Magnet / Download",
    description: "Offer a free guide, report, or resource in exchange for contact details.",
    defaultSlugPrefix: "download",
    sections: [
      {
        id: "hero",
        name: "Hero",
        blocks: [
          {
            id: blockId("headline"),
            type: "headline",
            props: {
              text: "Free Guide: How to Maximize Your Property Value",
              level: "h1",
              alignment: "center",
            },
          },
          {
            id: blockId("subheadline"),
            type: "subheadline",
            props: {
              text: "Download our expert guide with 10 proven strategies to increase your home's value before selling.",
              alignment: "center",
            },
          },
        ],
      },
      {
        id: "benefits",
        name: "Benefits",
        blocks: [
          {
            id: blockId("body-text"),
            type: "body-text",
            props: {
              content: "In this guide you'll learn:\n- The top renovations that add the most value\n- How to present your property for maximum appeal\n- Market timing strategies from local experts\n- Common mistakes sellers make (and how to avoid them)",
            },
          },
        ],
      },
      {
        id: "trust",
        name: "Trust",
        blocks: [
          {
            id: blockId("trust-badges"),
            type: "trust-badges",
            props: {
              badges: [
                { text: "Instant download" },
                { text: "No spam, ever" },
                { text: "Expert advice" },
              ],
            },
          },
        ],
      },
    ],
    formFlow: {
      steps: [
        {
          id: "capture",
          title: "Get Your Free Guide",
          description: "Enter your details below and we'll send it straight to your inbox.",
          layout: "single",
          blocks: [
            {
              id: blockId("text-input"),
              type: "text-input",
              props: { label: "First Name", placeholder: "John", required: true, fieldName: "firstName" },
            },
            {
              id: blockId("email-input"),
              type: "email-input",
              props: { label: "Email Address", placeholder: "john@example.com", required: true, fieldName: "email" },
            },
            {
              id: blockId("checkbox"),
              type: "checkbox",
              props: {
                label: "I'd like to receive property market updates and tips.",
                required: false,
                fieldName: "marketingConsent",
              },
            },
          ],
        },
      ],
      submitButtonText: "Download Free Guide",
      successTitle: "Check Your Inbox!",
      successMessage: "Your guide is on its way. Check your email for the download link.",
    },
  };
}

// =============================================================================
// NEWSLETTER SIGNUP TEMPLATE
// =============================================================================

function createNewsletterTemplate(): PageTemplate {
  resetIds();

  return {
    pageType: "newsletter",
    name: "Newsletter Signup",
    description: "Simple email capture for newsletter or market update subscriptions.",
    defaultSlugPrefix: "subscribe",
    sections: [
      {
        id: "hero",
        name: "Hero",
        blocks: [
          {
            id: blockId("headline"),
            type: "headline",
            props: {
              text: "Stay Ahead of the Property Market",
              level: "h1",
              alignment: "center",
            },
          },
          {
            id: blockId("subheadline"),
            type: "subheadline",
            props: {
              text: "Get weekly insights on property values, market trends, and expert tips delivered to your inbox.",
              alignment: "center",
            },
          },
        ],
      },
      {
        id: "social-proof",
        name: "Social Proof",
        blocks: [
          {
            id: blockId("stats-bar"),
            type: "stats-bar",
            props: {
              stats: [
                { label: "Subscribers", value: "5,000+" },
                { label: "Weekly Issues", value: "200+" },
                { label: "Open Rate", value: "45%" },
              ],
            },
          },
        ],
      },
    ],
    formFlow: {
      steps: [
        {
          id: "subscribe",
          title: "Subscribe to Our Newsletter",
          blocks: [
            {
              id: blockId("text-input"),
              type: "text-input",
              props: { label: "First Name", placeholder: "John", required: false, fieldName: "firstName" },
            },
            {
              id: blockId("email-input"),
              type: "email-input",
              props: { label: "Email Address", placeholder: "john@example.com", required: true, fieldName: "email" },
            },
          ],
        },
      ],
      submitButtonText: "Subscribe Now",
      successTitle: "You're Subscribed!",
      successMessage: "Welcome aboard. You'll receive your first update this week.",
    },
  };
}

// =============================================================================
// WEBINAR / EVENT REGISTRATION TEMPLATE
// =============================================================================

function createWebinarTemplate(): PageTemplate {
  resetIds();

  return {
    pageType: "webinar",
    name: "Webinar / Event Registration",
    description: "Registration page for webinars, open homes, seminars, or community events.",
    defaultSlugPrefix: "register",
    sections: [
      {
        id: "hero",
        name: "Hero",
        blocks: [
          {
            id: blockId("headline"),
            type: "headline",
            props: {
              text: "Free Webinar: 2026 Property Market Outlook",
              level: "h1",
              alignment: "center",
            },
          },
          {
            id: blockId("subheadline"),
            type: "subheadline",
            props: {
              text: "Join our expert panel to learn what's ahead for the NZ property market and how to position yourself for success.",
              alignment: "center",
            },
          },
        ],
      },
      {
        id: "details",
        name: "Event Details",
        blocks: [
          {
            id: blockId("body-text"),
            type: "body-text",
            props: {
              content: "**When:** Thursday, March 15 at 7:00 PM NZST\n**Duration:** 45 minutes + Q&A\n**Where:** Online via Zoom (link sent after registration)\n**Cost:** Free",
            },
          },
        ],
      },
      {
        id: "speakers",
        name: "Speakers",
        blocks: [
          {
            id: blockId("agent-card"),
            type: "agent-card",
            props: {
              name: "Your Agent Name",
              title: "Senior Property Consultant",
              bio: "15+ years of experience in the local property market.",
            },
          },
        ],
      },
    ],
    formFlow: {
      steps: [
        {
          id: "register",
          title: "Reserve Your Spot",
          description: "Limited places available. Register now to secure yours.",
          layout: "two-column",
          blocks: [
            {
              id: blockId("text-input"),
              type: "text-input",
              props: { label: "First Name", placeholder: "John", required: true, fieldName: "firstName" },
            },
            {
              id: blockId("text-input"),
              type: "text-input",
              props: { label: "Last Name", placeholder: "Smith", required: true, fieldName: "lastName" },
            },
            {
              id: blockId("email-input"),
              type: "email-input",
              props: { label: "Email Address", placeholder: "john@example.com", required: true, fieldName: "email" },
            },
            {
              id: blockId("phone-input"),
              type: "phone-input",
              props: { label: "Phone Number", placeholder: "021 123 4567", required: false, fieldName: "phone" },
            },
          ],
        },
      ],
      submitButtonText: "Register Now",
      successTitle: "You're Registered!",
      successMessage: "Check your email for the webinar link and calendar invite.",
    },
  };
}

// =============================================================================
// PROPERTY MANAGEMENT INQUIRY TEMPLATE
// =============================================================================

function createInquiryTemplate(): PageTemplate {
  resetIds();

  return {
    pageType: "inquiry",
    name: "Property Management Inquiry",
    description: "Capture property management inquiries from landlords and investors.",
    defaultSlugPrefix: "pm-inquiry",
    sections: [
      {
        id: "hero",
        name: "Hero",
        blocks: [
          {
            id: blockId("headline"),
            type: "headline",
            props: {
              text: "Professional Property Management You Can Trust",
              level: "h1",
              alignment: "center",
            },
          },
          {
            id: blockId("subheadline"),
            type: "subheadline",
            props: {
              text: "Let us handle the hard work while you enjoy reliable rental income and peace of mind.",
              alignment: "center",
            },
          },
        ],
      },
      {
        id: "benefits",
        name: "Benefits",
        blocks: [
          {
            id: blockId("stats-bar"),
            type: "stats-bar",
            props: {
              stats: [
                { label: "Properties Managed", value: "500+" },
                { label: "Average Occupancy", value: "98%" },
                { label: "Client Retention", value: "95%" },
              ],
            },
          },
        ],
      },
    ],
    formFlow: {
      steps: [
        {
          id: "property",
          title: "Tell Us About Your Property",
          blocks: [
            {
              id: blockId("address-finder"),
              type: "address-finder",
              props: {
                label: "Property Address",
                placeholder: "Start typing your property address...",
                required: true,
                fieldName: "addressFull",
              },
            },
            {
              id: blockId("radio-cards"),
              type: "radio-cards",
              props: {
                fieldName: "propertyType",
                columns: 2,
                required: true,
                autoAdvance: true,
                options: [
                  { value: "house", label: "House", icon: "Home" },
                  { value: "apartment", label: "Apartment", icon: "Building" },
                  { value: "townhouse", label: "Townhouse", icon: "Building2" },
                  { value: "other", label: "Other", icon: "MoreHorizontal" },
                ],
              },
            },
          ],
        },
        {
          id: "contact",
          title: "How Can We Reach You?",
          layout: "two-column",
          blocks: [
            {
              id: blockId("text-input"),
              type: "text-input",
              props: { label: "First Name", placeholder: "John", required: true, fieldName: "firstName" },
            },
            {
              id: blockId("text-input"),
              type: "text-input",
              props: { label: "Last Name", placeholder: "Smith", required: true, fieldName: "lastName" },
            },
            {
              id: blockId("email-input"),
              type: "email-input",
              props: { label: "Email Address", placeholder: "john@example.com", required: true, fieldName: "email" },
            },
            {
              id: blockId("phone-input"),
              type: "phone-input",
              props: { label: "Phone Number", placeholder: "021 123 4567", required: true, fieldName: "phone" },
            },
          ],
        },
      ],
      submitButtonText: "Get a Free Consultation",
      successTitle: "Thank You!",
      successMessage: "One of our property managers will be in touch within 24 hours.",
    },
  };
}

// =============================================================================
// CUSTOM FORM TEMPLATE (bare starting point)
// =============================================================================

function createCustomTemplate(): PageTemplate {
  resetIds();

  return {
    pageType: "custom",
    name: "Custom Form",
    description: "Start with a blank canvas and build your own landing page and form flow.",
    defaultSlugPrefix: "page",
    sections: [
      {
        id: "hero",
        name: "Hero",
        blocks: [
          {
            id: blockId("headline"),
            type: "headline",
            props: {
              text: "Your Headline Here",
              level: "h1",
              alignment: "center",
            },
          },
          {
            id: blockId("subheadline"),
            type: "subheadline",
            props: {
              text: "Add a compelling subheadline that explains your offer.",
              alignment: "center",
            },
          },
        ],
      },
    ],
    formFlow: {
      steps: [
        {
          id: "contact",
          title: "Get in Touch",
          blocks: [
            {
              id: blockId("text-input"),
              type: "text-input",
              props: { label: "Name", placeholder: "Your name", required: true, fieldName: "firstName" },
            },
            {
              id: blockId("email-input"),
              type: "email-input",
              props: { label: "Email", placeholder: "you@example.com", required: true, fieldName: "email" },
            },
          ],
        },
      ],
      submitButtonText: "Submit",
      successTitle: "Thank You!",
      successMessage: "We've received your submission and will be in touch soon.",
    },
  };
}

// =============================================================================
// TEMPLATE REGISTRY
// =============================================================================

export function getPageTemplate(pageType: PageType): PageTemplate {
  switch (pageType) {
    case "appraisal": return createAppraisalTemplate();
    case "lead_magnet": return createLeadMagnetTemplate();
    case "newsletter": return createNewsletterTemplate();
    case "webinar": return createWebinarTemplate();
    case "inquiry": return createInquiryTemplate();
    case "custom": return createCustomTemplate();
  }
}

export function getAllPageTemplates(): PageTemplate[] {
  return [
    createAppraisalTemplate(),
    createLeadMagnetTemplate(),
    createNewsletterTemplate(),
    createWebinarTemplate(),
    createInquiryTemplate(),
    createCustomTemplate(),
  ];
}
