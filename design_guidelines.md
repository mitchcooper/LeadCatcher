# LeadConverter Design Guidelines

## Design Approach

**Selected Approach:** Design System with Modern SaaS Inspiration

Drawing from Linear, Notion, and Stripe Dashboard patterns for clean, efficiency-focused interfaces. This application prioritizes data clarity, form usability, and dashboard functionality over visual experimentation.

**Core Principles:**
- Clarity over decoration
- Scannable information hierarchy
- Efficient user workflows
- Consistent, predictable patterns

---

## Typography

**Font Stack:**
- Primary: Inter (Google Fonts) - UI text, forms, buttons
- Monospace: JetBrains Mono - data tables, metrics, code snippets

**Hierarchy:**
- Page Titles: text-3xl font-semibold
- Section Headers: text-xl font-semibold
- Card Titles: text-lg font-medium
- Body Text: text-base font-normal
- Small Labels: text-sm font-medium
- Data/Metrics: text-2xl font-bold (monospace)
- Helper Text: text-sm text-gray-600

---

## Layout System

**Spacing Primitives:**
Use Tailwind units: **2, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4, p-6, p-8
- Section gaps: gap-4, gap-6, gap-8
- Margins: m-2, m-4, m-6

**Grid Structure:**
- Dashboard: 12-column grid (grid-cols-12)
- Content areas: max-w-7xl mx-auto px-6
- Sidebar: fixed w-64 (desktop), hidden (mobile with drawer)
- Main content: Flexible, fills remaining space

**Key Layouts:**
- Dashboard: Sidebar + main content area
- Tables: Full-width with horizontal scroll on mobile
- Forms: Single column, max-w-2xl for readability
- Stat Cards: Grid of 2-4 columns (responsive)

---

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed header, h-16, border-b
- Logo left, user menu/notifications right
- Search bar center (desktop only)

**Sidebar Navigation:**
- Vertical list with icons + labels
- Active state: subtle background fill
- Grouped sections with dividers
- Collapsed state on mobile

### Data Display
**Tables:**
- Zebra striping for row distinction
- Sticky header on scroll
- Row hover states
- Sortable column headers with icons
- Pagination at bottom

**Stat Cards:**
- Compact cards (p-6) with metric + label
- Large number display (text-2xl monospace)
- Trend indicators (↑↓ with percentage)
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-4

**Lead/Contact Cards:**
- Avatar/initials circle left
- Name + company stacked
- Status badge (rounded-full px-3 py-1 text-xs)
- Action buttons right-aligned
- Border with subtle shadow

### Forms
**Input Fields:**
- Full-width in containers
- Label above input (text-sm font-medium mb-2)
- Input height: h-10 or h-12
- Rounded corners: rounded-lg
- Border with focus states
- Helper text below (text-sm)

**Buttons:**
- Primary: Solid fill, font-medium, px-6 py-2.5, rounded-lg
- Secondary: Border style, same sizing
- Icon buttons: Square, p-2, rounded-lg
- Destructive actions: Distinct styling

**Select/Dropdown:**
- Match input styling
- Chevron icon right
- Custom dropdown menu with max-height + scroll

### Modals/Dialogs
- Backdrop overlay with blur
- Centered modal: max-w-lg to max-w-2xl
- Header with title + close button
- Content area with proper padding
- Footer with action buttons right-aligned

### Empty States
- Centered icon (large, 64px)
- Headline (text-lg font-medium)
- Description text
- Primary CTA button
- Illustration or simple icon

---

## Page Templates

### Dashboard
- Top stats row (4 metric cards)
- Main content area with recent leads table
- Secondary sidebar with quick actions/filters
- Chart section for conversion funnel

### Lead Detail View
- Header with lead name, status, and actions
- Tabbed interface (Activity, Details, Notes)
- Timeline/activity feed
- Form for editing details
- Related contacts section

### Lead List View
- Filter bar at top (search, status, date range)
- Table with sortable columns
- Bulk actions toolbar (appears on selection)
- Pagination controls

### Settings Page
- Two-column layout (sidebar nav + content)
- Form sections with clear grouping
- Save button sticky at bottom

---

## Responsive Behavior

**Mobile (< 768px):**
- Sidebar collapses to hamburger menu
- Tables scroll horizontally
- Stat cards stack to single column
- Reduce padding (p-4 instead of p-8)

**Tablet (768px - 1024px):**
- 2-column stat cards
- Condensed sidebar
- Maintain core functionality

**Desktop (> 1024px):**
- Full sidebar visible
- 4-column stat cards
- Multi-column layouts for forms where appropriate

---

## Animation Guidelines

**Minimal Motion:**
- Page transitions: None (instant navigation)
- Dropdown menus: Simple opacity + slide (200ms)
- Toast notifications: Slide in from top-right (300ms)
- Modal appearance: Fade in backdrop + scale modal (200ms)
- Loading states: Skeleton screens (no spinners unless necessary)

**Avoid:**
- Page scroll animations
- Parallax effects
- Decorative animations
- Hover scale effects on cards

---

## Accessibility Standards

- All form inputs have associated labels
- Color is not the only indicator of state
- Keyboard navigation for all interactive elements
- Focus indicators clearly visible
- ARIA labels for icon-only buttons
- Sufficient contrast ratios throughout
- Responsive font sizes (never below 14px for body text)

---

## Icons

**Library:** Heroicons (via CDN)
- Navigation: outline style, 24px
- Inline icons: outline style, 20px
- Action buttons: solid style, 20px
- Status indicators: mini style, 16px

Use consistently throughout - don't mix icon styles within the same context.