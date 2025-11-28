# Property Appraisal Application Modernization Plan

## Executive Summary

This document outlines a comprehensive plan to modernize the Cooper & Co property appraisal lead generation application. The goal is to transform the existing Flask/Jinja2 application into a world-class lead conversion platform with a modern React frontend and a flexible, block-based page builder backend.

---

## Part 1: Current State Analysis

### Existing Architecture
- **Backend**: Flask 3.0.3 with SQLAlchemy, PostgreSQL
- **Frontend**: Jinja2 templates, Bootstrap 5, vanilla JavaScript
- **Integrations**: NZ AddressFinder API, Mapbox, SendGrid (to be replaced), Cooper & Co Lead API, Cloudinary (to be replaced)

### Current Features
1. Multi-step property appraisal form (4 steps)
2. Address autocomplete with NZ AddressFinder
3. Dynamic suburb-specific messaging
4. Landing page management (basic)
5. Trust content/testimonials management
6. Lead submission to CRM via webhook
7. Email notifications via SendGrid
8. Admin dashboard with statistics

### Current Limitations
1. **Rigid page structure** - Landing pages only support title, body text, hero (image/video), and trust content
2. **No visual page builder** - Admins must understand HTML for trust content
3. **Limited form customization** - Fixed 4-step flow with hardcoded fields
4. **Dated UI/UX** - Basic Bootstrap styling, no micro-interactions or modern design patterns
5. **No A/B testing capabilities** - Can't test different page variants
6. **No analytics integration** - Only basic view counts
7. **Poor mobile optimization** - Functional but not optimized for mobile conversion
8. **No personalization** - Same experience for all visitors

---

## Part 2: Proposed Architecture

### Technology Stack Recommendation

#### Option A: Full React Rebuild (Recommended)
```
Frontend:  React 18 + TypeScript + Vite
Styling:   Tailwind CSS + Framer Motion
State:     Zustand or React Query
Backend:   Express.js + TypeScript (Node.js)
Validation: Zod (TypeScript-native, similar to Pydantic)
Database:  Supabase (PostgreSQL)
Storage:   Supabase Storage
Email:     Campaign Monitor Transactional
```

#### Option B: Incremental Modernization (Not Recommended)
```
Frontend:  Keep Flask, add React components via Islands Architecture
Styling:   Tailwind CSS overlay on existing
Backend:   Extend existing Flask API endpoints
```

**Recommendation**: Option A (Fullstack JavaScript) provides the best long-term value - single language across the stack, excellent TypeScript support, and native Replit support for this stack configuration.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PUBLIC LANDING PAGES                         │
│  React SPA with dynamic page rendering from block configurations    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           REST API LAYER                            │
│  /api/pages/:slug    - Get page configuration                       │
│  /api/submit         - Form submission                              │
│  /api/suburb-text    - Dynamic suburb content                       │
│  /api/analytics      - Track events                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN DASHBOARD                             │
│  Visual page builder with drag-and-drop blocks                      │
│  Form flow configuration                                            │
│  Analytics and A/B testing                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                               │
│  Lead Processing → Campaign Monitor + CRM Webhook                   │
│  Image/File Storage → Supabase Storage                              │
│  Address Lookup → NZ AddressFinder                                  │
│  Database → Supabase (PostgreSQL)                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Block-Based Page Builder System

### Block Types (Derived from Existing + New)

#### Form Input Blocks
| Block ID | Name | Description | Configuration Options |
|----------|------|-------------|----------------------|
| `address-finder` | Address Finder | NZ address autocomplete with map | Show map, require selection, placeholder text |
| `text-input` | Text Input | Single line text field | Label, placeholder, validation (name/email/phone/custom regex) |
| `email-input` | Email Input | Email field with validation | Label, placeholder, required |
| `phone-input` | Phone Input | NZ phone with formatting | Label, placeholder, required, format |
| `radio-cards` | Radio Card Selection | Visual radio buttons | Options array, columns (1-4), icons |
| `dropdown` | Dropdown Select | Standard dropdown | Options array, placeholder |
| `textarea` | Text Area | Multi-line input | Label, placeholder, rows, max length |
| `checkbox` | Checkbox/Consent | Single checkbox | Label, required, link text |
| `hidden` | Hidden Field | Pass data (e.g., UTM params) | Field name, default value |

#### Content Blocks
| Block ID | Name | Description | Configuration Options |
|----------|------|-------------|----------------------|
| `hero-image` | Hero Image | Full-width image hero | Image URL, alt text, overlay, height |
| `hero-video` | Hero Video | YouTube/Vimeo hero | Video URL, autoplay, muted, overlay |
| `hero-split` | Split Hero | Image + content side by side | Image position (left/right), content |
| `headline` | Headline | Main headline text | Text, size (h1-h3), alignment, color |
| `subheadline` | Subheadline | Supporting text | Text, size, alignment |
| `body-text` | Body Text | Rich text content | HTML content, max-width |
| `suburb-dynamic` | Dynamic Suburb Text | Auto-populated suburb content | Fallback text, merge fields |
| `spacer` | Spacer | Vertical spacing | Height (px or responsive) |
| `divider` | Divider | Horizontal line | Style (solid/dashed/gradient), color |

#### Social Proof Blocks
| Block ID | Name | Description | Configuration Options |
|----------|------|-------------|----------------------|
| `testimonial-card` | Testimonial Card | Single testimonial | Name, role, quote, image, rating |
| `testimonial-carousel` | Testimonial Carousel | Rotating testimonials | Testimonials array, autoplay, speed |
| `video-testimonial` | Video Testimonial | Video with quote | Video URL, name, quote |
| `stats-bar` | Statistics Bar | Key metrics display | Stats array [{value, label}] |
| `trust-badges` | Trust Badges | Logo/badge row | Images array, grayscale option |
| `agent-card` | Agent Profile | Agent info with photo | Name, title, photo, phone, email |
| `sold-properties` | Recent Sales | Map or list of sales | Count, show map, suburb filter |

#### Layout Blocks
| Block ID | Name | Description | Configuration Options |
|----------|------|-------------|----------------------|
| `container` | Container | Wrapper with max-width | Max-width, padding, background |
| `columns` | Columns | Multi-column layout | Column count, gap, responsive behavior |
| `card` | Card | Elevated content box | Padding, shadow, border-radius |
| `accordion` | Accordion/FAQ | Collapsible sections | Items array [{title, content}] |
| `tabs` | Tabs | Tabbed content | Tabs array [{label, content}] |

#### Conversion Blocks
| Block ID | Name | Description | Configuration Options |
|----------|------|-------------|----------------------|
| `cta-button` | CTA Button | Primary action button | Text, action (next step/submit/scroll), style |
| `sticky-bar` | Sticky Bar | Fixed position bar | Content, position (top/bottom), show after scroll |
| `exit-intent` | Exit Intent Popup | Popup on exit | Content blocks, trigger settings |
| `countdown` | Countdown Timer | Urgency countdown | End date/time, expired message |
| `progress-bar` | Progress Indicator | Form progress | Show percentage, step labels |

### Block Configuration Schema

```json
{
  "blockId": "string",
  "blockType": "string",
  "config": {
    // Block-specific configuration
  },
  "visibility": {
    "desktop": true,
    "tablet": true,
    "mobile": true
  },
  "animations": {
    "entrance": "fadeIn|slideUp|none",
    "delay": 0
  },
  "conditions": {
    // Show/hide based on form state or URL params
  }
}
```

### Page Configuration Schema

```json
{
  "id": "uuid",
  "slug": "slug-url",
  "name": "Internal Name",
  "meta": {
    "title": "SEO Title",
    "description": "Meta description",
    "ogImage": "url"
  },
  "theme": {
    "primaryColor": "#001F3A",
    "secondaryColor": "#00AEEF",
    "fontFamily": "Inter",
    "borderRadius": "12px"
  },
  "sections": [
    {
      "id": "section-1",
      "name": "Hero Section",
      "blocks": [/* Block configurations */],
      "background": {
        "type": "color|gradient|image",
        "value": "string"
      },
      "padding": {
        "top": "4rem",
        "bottom": "4rem"
      }
    }
  ],
  "formFlow": {
    "steps": [
      {
        "id": "step-1",
        "name": "Address",
        "blocks": ["block-id-1", "block-id-2"],
        "validation": {}
      }
    ],
    "submitAction": {
      "webhook": "url",
      "email": "email",
      "redirectUrl": "/thank-you"
    }
  },
  "analytics": {
    "trackingId": "string",
    "goals": []
  }
}
```

---

## Part 4: World-Class Landing Page UI/UX Design

### Design Principles for High-Converting Real Estate Landing Pages

#### 1. Visual Hierarchy & Attention Flow
- **F-pattern layout** for scanning content
- **Single focal point** per viewport (usually the CTA)
- **Progressive disclosure** - reveal complexity as user engages
- **Whitespace** as a design element, not empty space

#### 2. Mobile-First Conversion Design
- **Thumb-friendly** touch targets (min 48x48px)
- **Bottom-anchored CTAs** in mobile view
- **Swipe gestures** for testimonial carousels
- **Collapsible sections** to reduce scroll fatigue
- **Sticky address bar** that follows user

#### 3. Trust & Credibility Signals
- **Agent photo and credentials** visible early
- **Video testimonials** (3x more effective than text)
- **Real-time social proof** ("12 appraisals requested today")
- **Suburb-specific data** ("We've sold 47 homes in Devonport")
- **Awards/certifications** badges

#### 4. Micro-Interactions & Delight
- **Smooth step transitions** with Framer Motion
- **Form field animations** (floating labels, success states)
- **Map marker animation** when address selected
- **Progress celebration** micro-animations
- **Hover states** that preview actions

#### 5. Urgency & Scarcity (Ethical)
- **Market timing messages** ("Interest rates just dropped...")
- **Suburb activity** ("3 properties sold in your area this week")
- **Agent availability** ("John has 2 appraisal slots this week")

### Proposed UI Component Library

#### Color System
```css
/* Primary Brand */
--navy-900: #001F3A;     /* Primary dark */
--navy-700: #003366;     /* Primary medium */
--cyan-500: #00AEEF;     /* Accent/CTA */
--cyan-400: #33BFFF;     /* Accent hover */

/* Neutral */
--gray-50:  #F9FAFB;     /* Background */
--gray-100: #F3F4F6;     /* Card background */
--gray-200: #E5E7EB;     /* Borders */
--gray-500: #6B7280;     /* Body text */
--gray-900: #111827;     /* Headings */

/* Semantic */
--success: #10B981;
--warning: #F59E0B;
--error:   #EF4444;
```

#### Typography Scale
```css
/* Headings */
--h1: clamp(2rem, 5vw, 3.5rem);      /* Hero headline */
--h2: clamp(1.5rem, 4vw, 2.5rem);    /* Section titles */
--h3: clamp(1.25rem, 3vw, 1.75rem);  /* Card titles */

/* Body */
--body-lg: 1.125rem;                  /* Lead text */
--body: 1rem;                         /* Default */
--body-sm: 0.875rem;                  /* Captions */

/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

#### Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
```

### Example Page Layout (High-Converting)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo]                                    [Phone] [Agent Photo]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   "What's Your Home Worth in Today's Market?"                      │
│   Interest rates are at historic lows. Get your free appraisal.    │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │  🏠 Enter your property address                    [Go] │      │
│   └─────────────────────────────────────────────────────────┘      │
│                                                                     │
│   ✓ Free, no-obligation appraisal                                  │
│   ✓ Delivered within 24 hours                                      │
│   ✓ By local suburb expert                                         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│   │   412    │  │   $1.2M  │  │   14     │  │   98%    │          │
│   │  Homes   │  │  Average │  │   Days   │  │  Client  │          │
│   │  Sold    │  │  Price   │  │  On Mkt  │  │  Rating  │          │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   "John sold our house in 8 days for $50k over asking!"            │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │  [Video Testimonial Thumbnail with Play Button]          │      │
│   └─────────────────────────────────────────────────────────┘      │
│   — Sarah & Mike, Devonport                                        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Your Local Expert                                                │
│                                                                     │
│   ┌─────────┐  John Cooper                                         │
│   │ [Photo] │  Senior Sales Consultant                             │
│   │         │  15 years in North Shore                             │
│   └─────────┘  📞 021 123 4567                                     │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                     [Get My Free Appraisal]                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Multi-Step Form Flow (Optimized)

```
STEP 1: Address Entry
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🏠 What property would you like appraised?                       │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │  Start typing your address...                            │      │
│   └─────────────────────────────────────────────────────────┘      │
│                                                                     │
│                                    [Continue →]                     │
└─────────────────────────────────────────────────────────────────────┘

STEP 2: Relationship (animated transition, map appears)
┌───────────────────────────────────┬─────────────────────────────────┐
│                                   │                                 │
│   ────────────────── 50%          │        ┌─────────────────┐     │
│                                   │        │                 │     │
│   What's your relationship to     │        │   [Map with     │     │
│   this property?                  │        │    marker]      │     │
│                                   │        │                 │     │
│   ┌──────────┐  ┌──────────┐     │        └─────────────────┘     │
│   │  🏠      │  │  💰      │     │                                 │
│   │  Owner   │  │ Investor │     │   123 Example Street            │
│   │ Occupier │  │  Owner   │     │   Devonport, Auckland           │
│   └──────────┘  └──────────┘     │                                 │
│   ┌──────────┐  ┌──────────┐     │                                 │
│   │  🔑      │  │  📋      │     │                                 │
│   │  Buyer   │  │  Tenant  │     │                                 │
│   └──────────┘  └──────────┘     │                                 │
│                                   │                                 │
│   [← Back]                        │                                 │
└───────────────────────────────────┴─────────────────────────────────┘

STEP 3: Timeline
┌───────────────────────────────────┬─────────────────────────────────┐
│                                   │                                 │
│   ────────────────────── 75%      │        [Map]                   │
│                                   │                                 │
│   When are you thinking of        │                                 │
│   selling?                        │                                 │
│                                   │                                 │
│   ┌──────────┐  ┌──────────┐     │   "We've sold 47 homes in      │
│   │  ⚡      │  │  📅      │     │    Devonport this year"        │
│   │  Now     │  │ Within   │     │                                 │
│   │          │  │ 1 month  │     │                                 │
│   └──────────┘  └──────────┘     │                                 │
│   ┌──────────┐  ┌──────────┐     │                                 │
│   │  📆      │  │  🤔      │     │                                 │
│   │  2-6     │  │  Just    │     │                                 │
│   │  months  │  │ Curious  │     │                                 │
│   └──────────┘  └──────────┘     │                                 │
│                                   │                                 │
│   [← Back]                        │                                 │
└───────────────────────────────────┴─────────────────────────────────┘

STEP 4: Contact Details
┌───────────────────────────────────┬─────────────────────────────────┐
│                                   │                                 │
│   ──────────────────────────── 90%│        [Map]                   │
│                                   │                                 │
│   Almost there! Where should we   │                                 │
│   send your appraisal?            │                                 │
│                                   │                                 │
│   ┌─────────────────────────┐    │   ┌─────────────────────────┐   │
│   │  First name             │    │   │  Last name              │   │
│   └─────────────────────────┘    │   └─────────────────────────┘   │
│                                   │                                 │
│   ┌─────────────────────────┐    │   ┌─────────────────────────┐   │
│   │  Email                  │    │   │  Phone                  │   │
│   └─────────────────────────┘    │   └─────────────────────────┘   │
│                                   │                                 │
│   ☐ I agree to the privacy policy│                                 │
│                                   │                                 │
│   [← Back]  [Get My Free Appraisal]                                │
└───────────────────────────────────┴─────────────────────────────────┘

SUCCESS: Thank You
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                           ✓                                         │
│                                                                     │
│   Thanks, Sarah!                                                   │
│                                                                     │
│   Your appraisal request has been received.                        │
│   John will be in touch within 24 hours.                           │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │  What happens next?                                      │      │
│   │                                                          │      │
│   │  1. John reviews your property details                   │      │
│   │  2. He'll call to arrange a visit                        │      │
│   │  3. You'll receive your detailed appraisal               │      │
│   └─────────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 5: Admin Page Builder Interface

### Visual Editor Features

#### 1. Drag-and-Drop Canvas
- Left sidebar with block palette
- Center canvas with live preview
- Right sidebar for block configuration
- Responsive preview toggles (desktop/tablet/mobile)

#### 2. Block Library Panel
```
┌─────────────────────────────────────────────────────────────────────┐
│  BLOCKS                                          [Search blocks...] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  FORM INPUTS                                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                       │
│  │Address │ │ Text   │ │ Email  │ │ Phone  │                       │
│  │ Finder │ │ Input  │ │ Input  │ │ Input  │                       │
│  └────────┘ └────────┘ └────────┘ └────────┘                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                       │
│  │ Radio  │ │Dropdown│ │Checkbox│ │ Hidden │                       │
│  │ Cards  │ │        │ │        │ │ Field  │                       │
│  └────────┘ └────────┘ └────────┘ └────────┘                       │
│                                                                     │
│  CONTENT                                                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                       │
│  │ Hero   │ │ Hero   │ │Headline│ │ Body   │                       │
│  │ Image  │ │ Video  │ │        │ │ Text   │                       │
│  └────────┘ └────────┘ └────────┘ └────────┘                       │
│                                                                     │
│  SOCIAL PROOF                                                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                       │
│  │Testimo-│ │ Video  │ │ Stats  │ │ Agent  │                       │
│  │  nial  │ │Testimo.│ │  Bar   │ │ Card   │                       │
│  └────────┘ └────────┘ └────────┘ └────────┘                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3. Configuration Panel
```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADLINE SETTINGS                                           [×]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Content                                                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ What's Your Home Worth in Today's Market?                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Size          [H1 ▼]                                               │
│  Alignment     [○ Left  ● Center  ○ Right]                         │
│  Color         [■ #001F3A    ]                                      │
│                                                                     │
│  ─────────────────────────────────────────────────────────────     │
│  ANIMATION                                                          │
│  Entrance      [Fade In ▼]                                          │
│  Delay         [0ms        ]                                        │
│                                                                     │
│  ─────────────────────────────────────────────────────────────     │
│  VISIBILITY                                                         │
│  ☑ Desktop  ☑ Tablet  ☑ Mobile                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 4. Form Flow Editor
```
┌─────────────────────────────────────────────────────────────────────┐
│  FORM FLOW                                                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │   Step 1    │───▶│   Step 2    │───▶│   Step 3    │───▶ Submit  │
│  │   Address   │    │ Relationship│    │  Contact    │             │
│  └─────────────┘    └─────────────┘    └─────────────┘             │
│        ↓                  ↓                  ↓                      │
│  [Address Finder]  [Radio Cards]     [Text Inputs]                 │
│                    [Timeline Radio]  [Email Input]                 │
│                                      [Phone Input]                 │
│                                                                     │
│  [+ Add Step]                                                       │
│                                                                     │
│  ─────────────────────────────────────────────────────────────     │
│  SUBMIT ACTIONS                                                     │
│  ☑ Send to CRM webhook                                             │
│  ☑ Send email notification                                         │
│  ☐ Redirect to custom URL                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Part 6: Database Schema Updates

### New/Modified Tables

```sql
-- Enhanced landing_pages table
CREATE TABLE landing_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived

    -- SEO
    meta_title VARCHAR(256),
    meta_description TEXT,
    og_image_url VARCHAR(512),

    -- Theme overrides
    theme_config JSONB DEFAULT '{}',

    -- Page content (block-based)
    sections JSONB NOT NULL DEFAULT '[]',

    -- Form configuration
    form_flow JSONB NOT NULL DEFAULT '{}',

    -- Settings
    is_default BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,

    -- Analytics
    views INTEGER DEFAULT 0,
    submissions INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN views > 0 THEN (submissions::DECIMAL / views) * 100 ELSE 0 END
    ) STORED,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Block templates (reusable blocks)
CREATE TABLE block_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    block_type VARCHAR(64) NOT NULL,
    config JSONB NOT NULL,
    is_global BOOLEAN DEFAULT FALSE, -- Available on all pages
    created_at TIMESTAMP DEFAULT NOW()
);

-- A/B test variants
CREATE TABLE page_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    weight INTEGER DEFAULT 50, -- Traffic allocation percentage
    sections JSONB NOT NULL,
    form_flow JSONB,
    is_control BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0,
    submissions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced property_appraisals table
CREATE TABLE property_appraisals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Address data
    address VARCHAR(256) NOT NULL,
    suburb VARCHAR(64),
    city VARCHAR(64),
    postcode VARCHAR(10),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),

    -- Contact data
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,

    -- Form responses (dynamic)
    form_data JSONB DEFAULT '{}',

    -- Source tracking
    landing_page_id UUID REFERENCES landing_pages(id),
    variant_id UUID REFERENCES page_variants(id),
    utm_source VARCHAR(128),
    utm_medium VARCHAR(128),
    utm_campaign VARCHAR(128),
    referrer VARCHAR(512),

    -- Status
    status VARCHAR(20) DEFAULT 'new', -- new, contacted, converted, lost

    -- Integration tracking
    crm_submitted BOOLEAN DEFAULT FALSE,
    crm_response JSONB,
    email_sent BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id UUID REFERENCES landing_pages(id),
    variant_id UUID REFERENCES page_variants(id),
    session_id VARCHAR(64),
    event_type VARCHAR(64) NOT NULL, -- page_view, step_start, step_complete, submission
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_landing_pages_status ON landing_pages(status);
CREATE INDEX idx_appraisals_landing_page ON property_appraisals(landing_page_id);
CREATE INDEX idx_appraisals_created ON property_appraisals(created_at);
CREATE INDEX idx_analytics_landing_page ON analytics_events(landing_page_id);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
```

---

## Part 7: API Specification

### Public API Endpoints

```yaml
# Get landing page configuration
GET /api/pages/{slug}
Response:
  200:
    content:
      application/json:
        schema:
          type: object
          properties:
            page:
              $ref: '#/components/schemas/LandingPage'
            formFlow:
              $ref: '#/components/schemas/FormFlow'

# Get suburb-specific content
POST /api/suburb-text
Request:
  application/json:
    schema:
      type: object
      properties:
        suburb: string
Response:
  200:
    content:
      application/json:
        schema:
          type: object
          properties:
            text: string
            homesSold: integer

# Submit form
POST /api/submit
Request:
  application/json:
    schema:
      type: object
      properties:
        landingPageId: string
        variantId: string
        formData: object
Response:
  200:
    content:
      application/json:
        schema:
          type: object
          properties:
            success: boolean
            message: string

# Track analytics event
POST /api/analytics/event
Request:
  application/json:
    schema:
      type: object
      properties:
        pageId: string
        variantId: string
        sessionId: string
        eventType: string
        eventData: object
```

### Admin API Endpoints

```yaml
# Landing Pages CRUD
GET    /api/admin/pages
POST   /api/admin/pages
GET    /api/admin/pages/{id}
PUT    /api/admin/pages/{id}
DELETE /api/admin/pages/{id}
POST   /api/admin/pages/{id}/publish
POST   /api/admin/pages/{id}/duplicate

# Block Templates
GET    /api/admin/blocks/templates
POST   /api/admin/blocks/templates
DELETE /api/admin/blocks/templates/{id}

# A/B Testing
GET    /api/admin/pages/{id}/variants
POST   /api/admin/pages/{id}/variants
PUT    /api/admin/pages/{id}/variants/{variantId}
DELETE /api/admin/pages/{id}/variants/{variantId}

# Analytics
GET    /api/admin/analytics/overview
GET    /api/admin/analytics/pages/{id}
GET    /api/admin/analytics/funnel/{pageId}

# Media
POST   /api/admin/media/upload
DELETE /api/admin/media/{id}

# Submissions
GET    /api/admin/submissions
GET    /api/admin/submissions/{id}
PUT    /api/admin/submissions/{id}/status
```

---

## Part 8: Implementation Phases

### Phase 1: Foundation
1. Set up React project with Vite + TypeScript
2. Implement Tailwind CSS design system
3. Create core UI component library
4. Build multi-step form engine
5. Integrate AddressFinder and Mapbox
6. Set up Express.js API layer with TypeScript

### Phase 2: Public Pages (2-3 weeks)
1. Build block renderer system
2. Implement all block components
3. Create responsive layouts
4. Add Framer Motion animations
5. Build thank you page
6. Mobile optimization pass

### Phase 3: Admin Builder (3-4 weeks)
1. Build drag-and-drop canvas
2. Create block configuration panels
3. Implement form flow editor
4. Add page preview functionality
5. Build theme customization
6. Create page management interface

### Phase 4: Analytics & Optimization (1-2 weeks)
1. Implement event tracking
2. Build analytics dashboard
3. Create A/B testing framework
4. Add conversion funnel visualization

### Phase 5: Migration & Launch (1 week)
1. Data migration scripts
2. URL redirect mapping
3. Testing and QA
4. Performance optimization
5. Production deployment

---

## Part 9: Key Success Metrics

### Conversion Metrics
- **Form start rate**: % of visitors who begin the form
- **Step completion rates**: % completing each step
- **Overall conversion rate**: % of visitors who submit
- **Time to completion**: Average time to complete form
- **Abandonment points**: Where users drop off

### Technical Metrics
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Mobile PageSpeed Score**: > 90

### Business Metrics
- **Lead quality score**: Based on CRM feedback
- **Cost per lead**: Marketing spend / leads generated
- **Lead response time**: Time from submission to contact

---

## Part 10: Recommended Next Steps

1. **Approve architecture**: Confirm React rebuild vs incremental approach
2. **Design review**: Create high-fidelity mockups for key pages
3. **Technical spike**: Prototype block renderer and form engine
4. **API design finalization**: Lock down API contracts
5. **Development kickoff**: Begin Phase 1 implementation

---

## Appendix A: Block Component Reference

### Address Finder Block
```tsx
interface AddressFinderBlockConfig {
  placeholder: string;
  showMap: boolean;
  mapHeight: string;
  required: boolean;
  buttonText: string;
  errorMessage: string;
}
```

### Radio Cards Block
```tsx
interface RadioCardsBlockConfig {
  question: string;
  options: {
    value: string;
    label: string;
    icon?: string;
    description?: string;
  }[];
  columns: 1 | 2 | 3 | 4;
  required: boolean;
  autoAdvance: boolean;
}
```

### Testimonial Card Block
```tsx
interface TestimonialCardConfig {
  quote: string;
  authorName: string;
  authorRole?: string;
  authorImage?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  companyLogo?: string;
}
```

### Stats Bar Block
```tsx
interface StatsBarConfig {
  stats: {
    value: string;
    label: string;
    prefix?: string;
    suffix?: string;
  }[];
  columns: 2 | 3 | 4;
  animated: boolean;
}
```

---

## Appendix B: Theme Configuration Schema

```typescript
interface ThemeConfig {
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    error: string;
  };
  typography: {
    fontFamily: string;
    headingFamily?: string;
    baseFontSize: string;
    lineHeight: string;
  };
  spacing: {
    containerMaxWidth: string;
    sectionPadding: string;
    cardPadding: string;
  };
  borders: {
    radius: string;
    radiusLg: string;
    width: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}
```

---

## Appendix C: AddressFinder & Mapbox Integration Details

This appendix provides complete technical documentation of the existing address and map integrations, and how they will be implemented in the React rebuild.

### Current Implementation Analysis

#### NZ AddressFinder API

**What it is**: A New Zealand-specific address autocomplete service that provides accurate property addresses with metadata including coordinates, suburb, city, and postcode.

**API Provider**: https://addressfinder.nz (requires API key)

**Current Implementation** (from `app/static/js/main.js:32-159`):

```javascript
// Widget configuration
const widgetConfig = {
    show_locations: false,           // Don't show location suggestions
    address_params: {
        street: 0,                   // Include street in response
        suburb: 0,                   // Include suburb
        city: 0,                     // Include city
        region: 0,                   // Include region
        post_box: 0,                 // Exclude PO boxes
        region_code: 1               // Include region code
    },
    empty_content: 'No addresses found',
    manual_style: true,              // Use custom CSS classes
    max_results: 10,
    list_class: 'af_list',           // Dropdown container class
    item_class: 'af_item',           // Individual result class
    hover_class: 'af_hover',         // Hovered item class
    footer_class: 'af_footer',       // Footer with attribution
    error_class: 'af_error'          // Error message class
};

// Initialize widget on input element
mainWidget = new AddressFinder.Widget(
    document.getElementById('address'),  // Input element
    window.ADDRESS_FINDER_API_KEY,       // API key from environment
    'NZ',                                // Country code
    widgetConfig
);

// Handle address selection
mainWidget.on('result:select', function(fullAddress, metaData) {
    // fullAddress = "123 Example Street, Devonport, Auckland 0624"
    // metaData = {
    //   x: 174.7645,        // Longitude
    //   y: -36.8509,        // Latitude
    //   suburb: "Devonport",
    //   city: "Auckland",
    //   postcode: "0624",
    //   region: "Auckland",
    //   ...
    // }
});
```

**Data Captured on Selection**:

| Field | MetaData Key | Example Value | Usage |
|-------|--------------|---------------|-------|
| Full Address | `fullAddress` | "123 Example St, Devonport, Auckland 0624" | Display, CRM |
| Longitude | `metaData.x` | 174.7645 | Map marker |
| Latitude | `metaData.y` | -36.8509 | Map marker |
| Suburb | `metaData.suburb` | "Devonport" | Dynamic text lookup, CRM |
| City | `metaData.city` | "Auckland" | CRM |
| Postcode | `metaData.postcode` | "0624" | CRM |

**Two Widget Instances**: The current app creates two synchronized widgets:
1. **Main form widget** - In the form card at Step 1
2. **Sticky bar widget** - In the sticky header that appears on scroll

When either widget selects an address, both inputs are updated and the form data is stored.

**Suburb Text Lookup**: After address selection, the app fetches suburb-specific marketing text:

```javascript
// From main.js:128-155
const response = await fetch('/api/suburb-text', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({ suburb: metaData.suburb })
});

// Response: { text: "We've sold 47 homes in Devonport this year..." }
```

---

#### Mapbox GL JS

**What it is**: A JavaScript library for interactive, customizable vector maps.

**API Provider**: https://mapbox.com (requires access token)

**Current Implementation** (from `app/static/js/main.js:209-258`):

```javascript
// Initialize map (lazy - only when user reaches Step 2)
function initializeMap() {
    mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN;

    map = new mapboxgl.Map({
        container: 'map',                    // DOM element ID
        style: 'mapbox://styles/mitchellcooper/cm2y5ydqf00lt01pwe0ozfs28',  // Custom style
        center: [174.7645, -36.8509],        // Auckland CBD default [lng, lat]
        zoom: 11                             // Initial zoom level
    });

    // Add zoom/rotation controls
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', function() {
        mapInitialized = true;
        // Place marker if address already selected
        if (formData.long && formData.lat) {
            updateMapMarker([formData.long, formData.lat]);
        }
    });
}

// Update marker position with fly animation
function updateMapMarker(coordinates) {
    // Remove existing marker
    if (marker) {
        marker.remove();
    }

    // Create new marker at coordinates
    marker = new mapboxgl.Marker()
        .setLngLat(coordinates)      // [longitude, latitude]
        .addTo(map);

    // Animate map to new location
    map.flyTo({
        center: coordinates,
        zoom: 15,                    // Closer zoom for property view
        duration: 1000               // 1 second animation
    });
}
```

**Custom Map Style**: The app uses a custom Mapbox style (`mitchellcooper/cm2y5ydqf00lt01pwe0ozfs28`) - this would need to be recreated or the style ID retained for the new build.

**Split Layout Behavior**:

```javascript
// From main.js:345-396
async function showStep(stepNumber) {
    const container = document.querySelector('.form-map-container');

    // Toggle split layout class
    container.classList.toggle('split-layout', stepNumber > 1);

    if (stepNumber === 1) {
        // Step 1: Hide map, full-width form
        mapContainer.style.display = 'none';
    } else {
        // Steps 2-4: Show map, 50/50 split
        mapContainer.style.display = 'block';

        if (!mapInitialized) {
            await initializeMap();  // Lazy init
        } else {
            map.resize();  // Recalculate dimensions
        }

        // Update marker if we have coordinates
        if (formData.long && formData.lat) {
            updateMapMarker([formData.long, formData.lat]);
        }
    }
}
```

**CSS for Split Layout** (from `app/static/css/style.css:299-331`):

```css
/* Default: Full width form, no map */
.form-column { flex: 1; max-width: 100%; }
.map-column { flex: 0; max-width: 0; display: none; }

/* Split layout: 50/50 */
.form-map-container.split-layout .form-column {
    flex: 0 0 50%;
    max-width: 50%;
}
.form-map-container.split-layout .map-column {
    flex: 0 0 50%;
    max-width: 50%;
    display: block;
}

/* Map container */
#map {
    width: 100%;
    height: calc(100vh - 5rem);
    border-radius: 12px;
}
```

---

### React Implementation Plan

#### AddressFinder React Component

```tsx
// components/AddressFinderInput.tsx
import { useEffect, useRef, useCallback } from 'react';
import { useFormContext } from '../context/FormContext';

interface AddressMetadata {
  x: number;          // Longitude
  y: number;          // Latitude
  suburb: string;
  city: string;
  postcode: string;
  region?: string;
}

interface AddressFinderInputProps {
  placeholder?: string;
  onSelect?: (address: string, metadata: AddressMetadata) => void;
  className?: string;
  inputId?: string;
}

export function AddressFinderInput({
  placeholder = "Enter your property address",
  onSelect,
  className,
  inputId = "address"
}: AddressFinderInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<any>(null);
  const { setFormData, setMapCenter } = useFormContext();

  const handleAddressSelect = useCallback((fullAddress: string, metadata: AddressMetadata) => {
    // Update form data
    setFormData(prev => ({
      ...prev,
      address: fullAddress,
      lat: metadata.y,
      lng: metadata.x,
      suburb: metadata.suburb,
      city: metadata.city,
      postcode: metadata.postcode
    }));

    // Update map center
    setMapCenter([metadata.x, metadata.y]);

    // Fetch suburb-specific text
    fetchSuburbText(metadata.suburb);

    // Call optional callback
    onSelect?.(fullAddress, metadata);
  }, [setFormData, setMapCenter, onSelect]);

  useEffect(() => {
    // Wait for AddressFinder script to load
    if (!window.AddressFinder || !inputRef.current) return;

    const config = {
      show_locations: false,
      address_params: {
        street: 0, suburb: 0, city: 0,
        region: 0, post_box: 0, region_code: 1
      },
      empty_content: 'No addresses found',
      manual_style: true,
      max_results: 10,
      list_class: 'af-dropdown',
      item_class: 'af-item',
      hover_class: 'af-item-hover'
    };

    widgetRef.current = new window.AddressFinder.Widget(
      inputRef.current,
      import.meta.env.VITE_NZ_ADDRESS_FINDER_KEY,
      'NZ',
      config
    );

    widgetRef.current.on('result:select', handleAddressSelect);

    return () => {
      // Cleanup widget on unmount
      widgetRef.current?.destroy?.();
    };
  }, [handleAddressSelect]);

  return (
    <input
      ref={inputRef}
      id={inputId}
      type="text"
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
}

// Fetch suburb-specific marketing text
async function fetchSuburbText(suburb: string): Promise<string | null> {
  try {
    const response = await fetch('/api/suburb-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suburb })
    });

    if (response.ok) {
      const data = await response.json();
      return data.text;
    }
  } catch (error) {
    console.error('Failed to fetch suburb text:', error);
  }
  return null;
}
```

#### Mapbox React Component

Using `react-map-gl` (official React wrapper) or direct Mapbox GL JS:

```tsx
// components/PropertyMap.tsx
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useFormContext } from '../context/FormContext';

interface PropertyMapProps {
  className?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export function PropertyMap({
  className,
  initialCenter = [174.7645, -36.8509],  // Auckland default
  initialZoom = 11
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { mapCenter } = useFormContext();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mitchellcooper/cm2y5ydqf00lt01pwe0ozfs28',
      center: initialCenter,
      zoom: initialZoom
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update marker when mapCenter changes
  useEffect(() => {
    if (!map.current || !isLoaded || !mapCenter) return;

    // Remove existing marker
    marker.current?.remove();

    // Create new marker
    marker.current = new mapboxgl.Marker({
      color: '#00AEEF'  // Brand cyan color
    })
      .setLngLat(mapCenter)
      .addTo(map.current);

    // Fly to new location
    map.current.flyTo({
      center: mapCenter,
      zoom: 15,
      duration: 1000,
      essential: true
    });
  }, [mapCenter, isLoaded]);

  // Handle container resize
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const resizeObserver = new ResizeObserver(() => {
      map.current?.resize();
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => resizeObserver.disconnect();
  }, [isLoaded]);

  return (
    <div
      ref={mapContainer}
      className={className}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
    />
  );
}
```

#### Form Context for State Management

```tsx
// context/FormContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface FormData {
  address?: string;
  lat?: number;
  lng?: number;
  suburb?: string;
  city?: string;
  postcode?: string;
  relationship?: string;
  timeline?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface FormContextType {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  mapCenter: [number, number] | null;
  setMapCenter: React.Dispatch<React.SetStateAction<[number, number] | null>>;
  suburbText: string | null;
  setSuburbText: React.Dispatch<React.SetStateAction<string | null>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const FormContext = createContext<FormContextType | null>(null);

export function FormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<FormData>({});
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [suburbText, setSuburbText] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <FormContext.Provider value={{
      formData, setFormData,
      mapCenter, setMapCenter,
      suburbText, setSuburbText,
      currentStep, setCurrentStep
    }}>
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
}
```

#### Split Layout Component

```tsx
// components/FormLayout.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useFormContext } from '../context/FormContext';
import { PropertyMap } from './PropertyMap';

interface FormLayoutProps {
  children: ReactNode;
}

export function FormLayout({ children }: FormLayoutProps) {
  const { currentStep, mapCenter } = useFormContext();
  const showMap = currentStep > 1;

  return (
    <div className={`
      flex flex-col lg:flex-row
      min-h-[calc(100vh-4rem)]
      transition-all duration-500
    `}>
      {/* Form Column */}
      <motion.div
        className="w-full lg:px-8 py-6"
        animate={{
          width: showMap ? '50%' : '100%',
          maxWidth: showMap ? '50%' : '100%'
        }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>

      {/* Map Column */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)]"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '50%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <PropertyMap className="h-full rounded-2xl shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

### Environment Variables Required

```bash
# .env.local (React/Vite)
VITE_NZ_ADDRESS_FINDER_KEY=your_addressfinder_api_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=https://api.yoursite.com

# Backend (.env)
NZ_ADDRESS_FINDER_API_KEY=your_addressfinder_api_key
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
CAMPAIGN_MONITOR_API_KEY=your_campaign_monitor_api_key
CAMPAIGN_MONITOR_CLIENT_ID=your_client_id
LEAD_API_KEY=your_cooper_co_lead_api_key
```

### External Script Loading

The AddressFinder widget requires loading their JavaScript library. In React:

```tsx
// In index.html or via useEffect
<script src="https://api.addressfinder.io/assets/v3/widget.js" async></script>

// Or load dynamically in a hook
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://api.addressfinder.io/assets/v3/widget.js';
  script.async = true;
  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);
```

### Key Differences in React Implementation

| Aspect | Current (Vanilla JS) | New (React) |
|--------|---------------------|-------------|
| State management | Global `formData` object | React Context + hooks |
| Widget lifecycle | Manual init/cleanup | useEffect with cleanup |
| Map updates | Imperative `updateMapMarker()` | Reactive via `mapCenter` state |
| Layout transitions | CSS class toggle | Framer Motion animations |
| Component reuse | Copy/paste code | Reusable components |
| Type safety | None | Full TypeScript |

---

---

## Appendix D: Supabase & Campaign Monitor Integration

This appendix covers the new infrastructure services replacing the existing PostgreSQL/Cloudinary/SendGrid stack.

### Supabase Overview

**What it provides:**
- PostgreSQL database (hosted)
- Real-time subscriptions
- File storage (replaces Cloudinary)
- Row Level Security (RLS)
- Auto-generated REST API
- Authentication (optional, if needed later)

### Supabase Database Setup

```sql
-- Run these in Supabase SQL Editor to create the schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Landing Pages table
CREATE TABLE landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft',

    meta_title VARCHAR(256),
    meta_description TEXT,
    og_image_url VARCHAR(512),

    theme_config JSONB DEFAULT '{}',
    sections JSONB NOT NULL DEFAULT '[]',
    form_flow JSONB NOT NULL DEFAULT '{}',

    is_default BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,

    views INTEGER DEFAULT 0,
    submissions INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Appraisals (leads) table
CREATE TABLE property_appraisals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    address VARCHAR(256) NOT NULL,
    suburb VARCHAR(64),
    city VARCHAR(64),
    postcode VARCHAR(10),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),

    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,

    relationship VARCHAR(20),
    timeline VARCHAR(20),
    form_data JSONB DEFAULT '{}',

    landing_page_id UUID REFERENCES landing_pages(id),
    utm_source VARCHAR(128),
    utm_medium VARCHAR(128),
    utm_campaign VARCHAR(128),
    referrer VARCHAR(512),

    status VARCHAR(20) DEFAULT 'new',
    crm_submitted BOOLEAN DEFAULT FALSE,
    crm_response JSONB,
    email_sent BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suburbs table (for dynamic text)
CREATE TABLE suburbs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(64) UNIQUE NOT NULL,
    homes_sold INTEGER DEFAULT 0,
    custom_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Global Settings table
CREATE TABLE global_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(64) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Block Templates (reusable)
CREATE TABLE block_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    block_type VARCHAR(64) NOT NULL,
    config JSONB NOT NULL,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    landing_page_id UUID REFERENCES landing_pages(id),
    session_id VARCHAR(64),
    event_type VARCHAR(64) NOT NULL,
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_landing_pages_status ON landing_pages(status);
CREATE INDEX idx_appraisals_landing_page ON property_appraisals(landing_page_id);
CREATE INDEX idx_appraisals_created ON property_appraisals(created_at);
CREATE INDEX idx_appraisals_email ON property_appraisals(email);
CREATE INDEX idx_analytics_landing_page ON analytics_events(landing_page_id);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_suburbs_name ON suburbs(name);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER landing_pages_updated_at
    BEFORE UPDATE ON landing_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER property_appraisals_updated_at
    BEFORE UPDATE ON property_appraisals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER suburbs_updated_at
    BEFORE UPDATE ON suburbs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Supabase Storage Setup

Create a storage bucket for landing page images:

```javascript
// In Supabase Dashboard: Storage > Create Bucket
// Bucket name: "landing-page-assets"
// Public: Yes (for public image URLs)

// Storage policies (in SQL Editor):
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'landing-page-assets');

CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'landing-page-assets');

CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'landing-page-assets');
```

### Supabase Client Setup (Frontend)

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database
export interface Database {
  public: {
    Tables: {
      landing_pages: {
        Row: {
          id: string;
          slug: string;
          name: string;
          status: string;
          meta_title: string | null;
          meta_description: string | null;
          og_image_url: string | null;
          theme_config: Record<string, any>;
          sections: Record<string, any>[];
          form_flow: Record<string, any>;
          is_default: boolean;
          published_at: string | null;
          views: number;
          submissions: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<LandingPage['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<LandingPage['Insert']>;
      };
      property_appraisals: {
        Row: {
          id: string;
          address: string;
          suburb: string | null;
          city: string | null;
          postcode: string | null;
          lat: number | null;
          lng: number | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          relationship: string | null;
          timeline: string | null;
          form_data: Record<string, any>;
          landing_page_id: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          referrer: string | null;
          status: string;
          crm_submitted: boolean;
          crm_response: Record<string, any> | null;
          email_sent: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      suburbs: {
        Row: {
          id: string;
          name: string;
          homes_sold: number;
          custom_text: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
```

### Supabase Storage Service (Backend - TypeScript)

```typescript
// backend/src/services/storage.ts
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const BUCKET_NAME = 'landing-page-assets';

interface UploadResult {
  path: string;
  publicUrl: string;
  filename: string;
}

export async function uploadImage(
  fileData: Buffer,
  filename: string,
  contentType: string = 'image/jpeg'
): Promise<UploadResult> {
  // Generate unique filename
  const ext = filename.includes('.') ? filename.split('.').pop() : 'jpg';
  const uniqueFilename = `${uuidv4()}.${ext}`;
  const path = `images/${uniqueFilename}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, fileData, {
      contentType,
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return {
    path,
    publicUrl,
    filename: uniqueFilename
  };
}

export async function deleteImage(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    return !error;
  } catch (e) {
    console.error('Error deleting image:', e);
    return false;
  }
}
```

---

### Campaign Monitor Transactional Email Integration (TypeScript)

**API Documentation**: https://www.campaignmonitor.com/api/transactional/

```typescript
// backend/src/services/email.ts
import fetch from 'node-fetch';

const CM_API_KEY = process.env.CAMPAIGN_MONITOR_API_KEY!;
const CM_API_BASE = 'https://api.createsend.com/api/v3.3';

// Basic auth header
function getAuthHeader(): string {
  const credentials = Buffer.from(`${CM_API_KEY}:x`).toString('base64');
  return `Basic ${credentials}`;
}

interface AppraisalData {
  address: string;
  suburb?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship?: string;
  timeline?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendAppraisalNotification(
  toEmail: string,
  data: AppraisalData
): Promise<EmailResult> {
  const subject = `New Appraisal Request: ${data.address}`;

  const htmlBody = `
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #001F3A; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Appraisal Request</h1>
      </div>

      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #001F3A; margin-top: 0;">Property Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Address:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.address}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Suburb:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.suburb || 'N/A'}</td>
          </tr>
        </table>

        <h2 style="color: #001F3A;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><a href="tel:${data.phone}">${data.phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Relationship:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.relationship || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;"><strong>Timeline:</strong></td>
            <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">${data.timeline || 'N/A'}</td>
          </tr>
        </table>
      </div>

      <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>This is an automated notification from Cooper & Co Property Appraisals</p>
      </div>
    </body>
    </html>
  `;

  const textBody = `
New Appraisal Request

Property: ${data.address}
Suburb: ${data.suburb || 'N/A'}

Contact:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
Relationship: ${data.relationship || 'N/A'}
Timeline: ${data.timeline || 'N/A'}
  `;

  try {
    const response = await fetch(`${CM_API_BASE}/transactional/classicemail/send`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        From: 'appraisals@cooperandco.co.nz',
        To: [toEmail],
        Subject: subject,
        Html: htmlBody,
        Text: textBody,
        TrackOpens: true,
        TrackClicks: true,
        AddRecipientsToList: false
      })
    });

    if (response.ok) {
      const result = await response.json() as { MessageID?: string };
      return { success: true, messageId: result.MessageID };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function sendConfirmationEmail(
  toEmail: string,
  firstName: string,
  address: string
): Promise<EmailResult> {
  const subject = "We've received your appraisal request";

  const htmlBody = `
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #001F3A; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Thank You, ${firstName}!</h1>
      </div>

      <div style="padding: 30px;">
        <p style="font-size: 16px; line-height: 1.6;">
          We've received your appraisal request for:
        </p>

        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <strong style="color: #001F3A;">${address}</strong>
        </div>

        <h3 style="color: #001F3A;">What happens next?</h3>
        <ol style="line-height: 1.8;">
          <li>Our team will review your property details</li>
          <li>A local expert will contact you within 24 hours</li>
          <li>We'll arrange a convenient time to visit your property</li>
          <li>You'll receive your detailed appraisal report</li>
        </ol>

        <p style="margin-top: 30px;">
          If you have any questions in the meantime, feel free to call us on
          <a href="tel:092345678" style="color: #00AEEF;">09 234 5678</a>.
        </p>
      </div>

      <div style="padding: 20px; text-align: center; background: #f9f9f9; color: #666; font-size: 12px;">
        <p>Cooper & Co Real Estate Ltd (Licensed REAA 2008)</p>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch(`${CM_API_BASE}/transactional/classicemail/send`, {
      method: 'POST',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        From: 'appraisals@cooperandco.co.nz',
        To: [toEmail],
        Subject: subject,
        Html: htmlBody,
        TrackOpens: true,
        TrackClicks: true
      })
    });

    if (response.ok) {
      const result = await response.json() as { MessageID?: string };
      return { success: true, messageId: result.MessageID };
    }
    return { success: false };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// Smart Transactional Email (template-based)
export async function sendSmartEmail(
  smartEmailId: string,
  toEmail: string,
  data: Record<string, string>
): Promise<EmailResult> {
  try {
    const response = await fetch(
      `${CM_API_BASE}/transactional/smartemail/${smartEmailId}/send`,
      {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          To: [toEmail],
          Data: data,
          ConsentToTrack: 'yes'
        })
      }
    );

    return { success: response.ok };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
```

---

### Service Migration Summary

| Old Service | New Service | Notes |
|-------------|-------------|-------|
| PostgreSQL (Neon/direct) | Supabase PostgreSQL | Same SQL, hosted with extras |
| Cloudinary | Supabase Storage | Simpler, integrated with DB |
| SendGrid | Campaign Monitor Transactional | Classic or Smart Email API |

### Required Campaign Monitor Setup

1. **Create API Key**: Settings → API Keys → Create
2. **Verify Sending Domain**: Settings → Verified Domains → Add `cooperandco.co.nz`
3. **Optional - Smart Emails**: Transactional → Smart Transactional Emails → Create templates

### Required Supabase Setup

1. **Create Project**: https://supabase.com/dashboard
2. **Run SQL Schema**: Use the SQL above in SQL Editor
3. **Create Storage Bucket**: Storage → New Bucket → "landing-page-assets"
4. **Get Keys**: Settings → API → Copy URL and keys

---

## Appendix E: Express.js Backend Structure

This appendix provides the backend architecture for the Fullstack JavaScript approach.

### Project Structure

```
/backend
├── src/
│   ├── index.ts              # Express app entry point
│   ├── routes/
│   │   ├── index.ts          # Route aggregator
│   │   ├── pages.ts          # Landing page routes
│   │   ├── submissions.ts    # Form submission routes
│   │   ├── suburbs.ts        # Suburb text routes
│   │   └── admin/
│   │       ├── index.ts
│   │       ├── pages.ts      # Admin CRUD for pages
│   │       ├── submissions.ts
│   │       └── analytics.ts
│   ├── services/
│   │   ├── supabase.ts       # Supabase client
│   │   ├── storage.ts        # File uploads
│   │   ├── email.ts          # Campaign Monitor
│   │   └── leadApi.ts        # Cooper & Co CRM webhook
│   ├── schemas/
│   │   ├── submission.ts     # Zod validation schemas
│   │   ├── landingPage.ts
│   │   └── suburb.ts
│   ├── middleware/
│   │   ├── auth.ts           # Admin authentication
│   │   ├── validate.ts       # Zod validation middleware
│   │   └── rateLimit.ts
│   └── types/
│       └── index.ts          # Shared TypeScript types
├── package.json
├── tsconfig.json
└── .env
```

### Express App Setup

```typescript
// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

### Zod Validation Schemas

```typescript
// backend/src/schemas/submission.ts
import { z } from 'zod';

// NZ phone validation
const nzPhoneRegex = /^(\+?64|0)[1-9]\d{7,9}$/;

export const submissionSchema = z.object({
  address: z.string().min(5).max(256),
  suburb: z.string().max(64).optional(),
  city: z.string().max(64).optional(),
  postcode: z.string().max(10).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),

  firstName: z.string().min(2).max(64).regex(/^[a-zA-Z\s'-]+$/),
  lastName: z.string().min(2).max(64).regex(/^[a-zA-Z\s'-]+$/),
  email: z.string().email().max(120),
  phone: z.string().regex(nzPhoneRegex, 'Invalid NZ phone number'),

  relationship: z.enum(['owner-occupier', 'owner-investor', 'buyer', 'tenant']).optional(),
  timeline: z.enum(['now', 'within-month', '2-6-months', '6-plus-months', 'already-on-market', 'not-sure']).optional(),

  landingPageId: z.string().uuid().optional(),
  utmSource: z.string().max(128).optional(),
  utmMedium: z.string().max(128).optional(),
  utmCampaign: z.string().max(128).optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

// backend/src/schemas/landingPage.ts
export const landingPageSchema = z.object({
  slug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(128),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  metaTitle: z.string().max(256).optional(),
  metaDescription: z.string().optional(),
  ogImageUrl: z.string().url().optional(),
  themeConfig: z.record(z.any()).default({}),
  sections: z.array(z.any()).default([]),
  formFlow: z.record(z.any()).default({}),
  isDefault: z.boolean().default(false),
});

export type LandingPageInput = z.infer<typeof landingPageSchema>;
```

### Validation Middleware

```typescript
// backend/src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
}
```

### API Routes

```typescript
// backend/src/routes/pages.ts
import { Router } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

// Get landing page by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: page, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !page) {
      // Try to get default page
      const { data: defaultPage } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('is_default', true)
        .single();

      if (!defaultPage) {
        return res.status(404).json({ error: 'Page not found' });
      }

      // Increment views
      await supabase
        .from('landing_pages')
        .update({ views: defaultPage.views + 1 })
        .eq('id', defaultPage.id);

      return res.json({ page: defaultPage });
    }

    // Increment views
    await supabase
      .from('landing_pages')
      .update({ views: page.views + 1 })
      .eq('id', page.id);

    res.json({ page });
  } catch (e) {
    console.error('Error fetching page:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

// backend/src/routes/submissions.ts
import { Router } from 'express';
import { supabase } from '../services/supabase';
import { validate } from '../middleware/validate';
import { submissionSchema, SubmissionInput } from '../schemas/submission';
import { sendAppraisalNotification, sendConfirmationEmail } from '../services/email';
import { submitToLeadApi } from '../services/leadApi';

const router = Router();

router.post('/', validate(submissionSchema), async (req, res) => {
  try {
    const data: SubmissionInput = req.body;

    // Insert into database
    const { data: submission, error } = await supabase
      .from('property_appraisals')
      .insert({
        address: data.address,
        suburb: data.suburb,
        city: data.city,
        postcode: data.postcode,
        lat: data.lat,
        lng: data.lng,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        relationship: data.relationship,
        timeline: data.timeline,
        landing_page_id: data.landingPageId,
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
      })
      .select()
      .single();

    if (error) throw error;

    // Update landing page submission count
    if (data.landingPageId) {
      await supabase.rpc('increment_submissions', {
        page_id: data.landingPageId
      });
    }

    // Send emails (non-blocking)
    Promise.all([
      sendAppraisalNotification('appraisals@cooperandco.co.nz', {
        address: data.address,
        suburb: data.suburb,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        relationship: data.relationship,
        timeline: data.timeline,
      }),
      sendConfirmationEmail(data.email, data.firstName, data.address),
      submitToLeadApi(data)
    ]).catch(console.error);

    res.json({
      success: true,
      message: 'Appraisal request submitted successfully'
    });

  } catch (e) {
    console.error('Submission error:', e);
    res.status(500).json({
      success: false,
      error: 'Failed to submit appraisal request'
    });
  }
});

export default router;

// backend/src/routes/suburbs.ts
import { Router } from 'express';
import { supabase } from '../services/supabase';

const router = Router();

router.post('/text', async (req, res) => {
  try {
    const { suburb } = req.body;

    if (!suburb) {
      return res.status(400).json({ error: 'Suburb is required' });
    }

    // Try to find suburb-specific text
    const { data: suburbData } = await supabase
      .from('suburbs')
      .select('custom_text, homes_sold')
      .eq('name', suburb)
      .single();

    if (suburbData?.custom_text) {
      // Replace merge fields
      const text = suburbData.custom_text
        .replace(/\$\$suburb\$\$/g, suburb)
        .replace(/\$\$sold\$\$/g, String(suburbData.homes_sold || 0));

      return res.json({ text, homesSold: suburbData.homes_sold });
    }

    // Get default text for known suburbs
    const { data: defaultSetting } = await supabase
      .from('global_settings')
      .select('value')
      .eq('key', 'defined_suburb_default_text')
      .single();

    if (suburbData && defaultSetting?.value) {
      const text = defaultSetting.value
        .replace(/\$\$suburb\$\$/g, suburb)
        .replace(/\$\$sold\$\$/g, String(suburbData.homes_sold || 0));

      return res.json({ text, homesSold: suburbData.homes_sold });
    }

    // Get global fallback text
    const { data: globalSetting } = await supabase
      .from('global_settings')
      .select('value')
      .eq('key', 'global_suburb_text')
      .single();

    if (globalSetting?.value) {
      return res.json({ text: globalSetting.value, homesSold: 0 });
    }

    res.json({ text: null, homesSold: 0 });

  } catch (e) {
    console.error('Error fetching suburb text:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### Cooper & Co Lead API Service

```typescript
// backend/src/services/leadApi.ts
import fetch from 'node-fetch';
import { SubmissionInput } from '../schemas/submission';

const LEAD_API_URL = 'https://api.cooperandco.co.nz/GeneratedLeads/Public';
const LEAD_API_KEY = process.env.LEAD_API_KEY!;

interface LeadApiResponse {
  success: boolean;
  error?: string;
}

export async function submitToLeadApi(data: SubmissionInput): Promise<LeadApiResponse> {
  try {
    const payload = {
      clientName: `${data.firstName} ${data.lastName}`,
      address: data.address,
      email: data.email,
      phone: data.phone,
      suburb: data.suburb || '',
      notes: `Relationship: ${data.relationship || 'N/A'}, Timeline: ${data.timeline || 'N/A'}`,
      source: 'Property Appraisal Landing Page'
    };

    const response = await fetch(LEAD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LEAD_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.text();
      console.error('Lead API error:', error);
      return { success: false, error };
    }
  } catch (e) {
    console.error('Lead API exception:', e);
    return { success: false, error: String(e) };
  }
}
```

### Supabase Client

```typescript
// backend/src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Database function to increment submissions (run in Supabase SQL Editor)
/*
CREATE OR REPLACE FUNCTION increment_submissions(page_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE landing_pages
  SET submissions = submissions + 1
  WHERE id = page_id;
END;
$$ LANGUAGE plpgsql;
*/
```

### Package.json Dependencies

```json
{
  "name": "property-appraisal-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "node-fetch": "^3.3.2",
    "uuid": "^9.0.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/uuid": "^9.0.7",
    "tsx": "^4.6.2",
    "typescript": "^5.3.2"
  }
}
```

### TypeScript Config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

*Document Version: 1.3*
*Updated: November 2024*
*Author: Claude Code Assistant*
*Stack: Fullstack JavaScript (React + Express.js + TypeScript)*
