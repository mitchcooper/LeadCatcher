# LeadConverter

## Overview
LeadConverter is a full-stack TypeScript application for managing and converting leads. This project uses React 18 with Vite for the frontend and Express.js for the backend, with Supabase PostgreSQL for data persistence.

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** as build tool
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Shadcn/ui** component library
- **TanStack Query** for data fetching
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **Supabase** for PostgreSQL database
- **Drizzle ORM** for database operations
- **Zod** for validation

## Project Structure

```
/client              # React frontend
  /src
    /components/ui   # Shadcn UI components
    /hooks           # Custom React hooks
    /lib             # Utility functions
    /pages           # Page components
  index.html
/server              # Express backend
  /lib               # Server utilities (Supabase client)
  index.ts           # Server entry point
  routes.ts          # API routes
  storage.ts         # Storage interface
  vite.ts            # Vite dev server setup
  static.ts          # Static file serving
/shared              # Shared types and schemas
  schema.ts          # Drizzle schemas and types
```

## Environment Variables

### Required for Supabase
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

## API Endpoints

### Health Check
- `GET /api/health` - Returns server status and timestamp

## Development

The application runs on port 5000 with both frontend and backend served together via Vite middleware.

## Design Guidelines
See `design_guidelines.md` for UI/UX specifications including:
- Typography: Inter (UI), JetBrains Mono (data/metrics)
- Layout: Sidebar + main content dashboard pattern
- Colors: Modern SaaS-inspired color palette

## Recent Changes
- **2024**: Initial scaffolding setup with Hello World endpoints
- Frontend: React 18 + Vite + Tailwind + Framer Motion
- Backend: Express.js + TypeScript + Supabase client setup
