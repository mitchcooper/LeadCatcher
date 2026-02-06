# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LeadConverter** - A property appraisal lead generation platform with:
- Block-based landing page builder
- Multi-step appraisal request forms
- NZ AddressFinder integration for address autocomplete
- Mapbox integration for property location display
- Admin dashboard for managing pages and leads
- Analytics tracking

## Commands

- **Dev server**: `npm run dev` - starts Express server with Vite HMR on port 5000
- **Build**: `npm run build` - builds client (Vite) and server (esbuild) to `dist/`
- **Production**: `npm run start` - runs built production server
- **Type check**: `npm run check` - runs TypeScript compiler
- **Database push**: `npm run db:push` - pushes Drizzle schema changes to PostgreSQL

## Architecture

Full-stack TypeScript application with monorepo structure:

```
client/                    # React frontend (Vite)
  src/
    components/
      blocks/              # Block system components
        form/              # Form input blocks (AddressFinder, TextInput, etc.)
        content/           # Content blocks (Hero, Headline, etc.)
        social-proof/      # Social proof blocks (Testimonials, Stats, etc.)
        layout/            # Layout blocks (Container, Columns, Card)
        conversion/        # Conversion blocks (CTA, Progress, TrustBadges)
      form-steps/          # Multi-step form components
      ui/                  # shadcn/ui components
    context/               # React contexts (AppraisalFormContext)
    hooks/                 # Custom hooks (use-analytics, use-toast)
    lib/
      blocks/registry.ts   # Block registry system
      addressfinder.ts     # NZ AddressFinder API integration
      mapbox.ts            # Mapbox GL JS integration
    pages/
      admin/               # Admin dashboard pages
      landing.tsx          # Public landing page renderer
server/
  routes.ts                # API route definitions
  storage.ts               # Database access layer (IStorage)
  lib/db.ts                # Drizzle database connection
shared/
  schema.ts                # Drizzle schema + TypeScript types
  validations.ts           # Zod validation schemas
```

## Database

- **Drizzle ORM** with PostgreSQL (Neon serverless driver)
- **Shared database** with sister apps - all tables prefixed with `leads_`
- Tables: `leads_landing_pages`, `leads_property_appraisals`, `leads_suburbs`, `leads_block_templates`, `leads_analytics_events`
- Sister app tables declared in schema to prevent Drizzle from modifying them

## Key Patterns

- **Block Registry**: Singleton pattern for registering/retrieving block components (`client/src/lib/blocks/registry.ts`)
- **Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`
- **API routes**: All prefixed with `/api/`, admin routes under `/api/admin/`
- **Form context**: Multi-step form state managed via React Context (`AppraisalFormContext`)

## Routes

**Public:**
- `/` - Redirects to admin
- `/p/:slug` - Public landing page renderer
- `/api/pages/:slug` - Get published page by slug
- `/api/appraisals` - Submit appraisal form
- `/api/analytics/track` - Track analytics events

**Admin:**
- `/admin` - Dashboard
- `/admin/pages` - Landing pages list
- `/admin/pages/new` - Create new page
- `/admin/pages/:id` - Edit page
- `/admin/leads` - Leads list
- `/admin/analytics` - Analytics dashboard

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `ADDRESSFINDER_KEY` - NZ AddressFinder API key (client-side)
- `MAPBOX_ACCESS_TOKEN` - Mapbox access token (client-side)

## Block System

17 blocks across 5 categories:
- **Form**: AddressFinder, TextInput, EmailInput, PhoneInput, RadioCards, Checkbox
- **Content**: HeroImage, Headline, Subheadline, BodyText, Spacer
- **Social Proof**: TestimonialCard, StatsBar, AgentCard
- **Layout**: Container, Columns, Card
- **Conversion**: CtaButton, ProgressBar, TrustBadges

Each block has:
- React component with `BlockProps<T>` interface
- Metadata (name, description, category, icon)
- Props schema for the editor panel
- Default props
