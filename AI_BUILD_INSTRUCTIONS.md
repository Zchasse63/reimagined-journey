# AI Build Instructions: Food Service Distribution Platform

## Purpose

This document provides systematic instructions for an AI assistant to fully understand and execute the build-out of the Food Service Distribution Lead Generation Platform. **Read this document first, then follow the instructions exactly.**

---

## Critical: How to Read This Project

### Rule 1: Read Every File Completely

Do not skim. Do not summarize prematurely. Each document contains specific technical decisions, exact values, and implementation details that are required for correct execution. Missing a single configuration value or design token will cause inconsistencies.

### Rule 2: Read in the Specified Order

The documents build on each other. Reading out of order will cause confusion about why certain decisions were made.

### Rule 3: Confirm Understanding Before Building

After reading all documents, create a phased implementation plan. Do not start coding until you have mapped every component, API integration, and database table to a specific phase.

### Rule 4: Reference Documents During Implementation

Keep documents accessible. When implementing a component, re-read the relevant section. Do not rely on memory—verify against the source documentation.

---

## Document Reading Order

Read each document **in full, from start to finish**, in this exact order:

### Step 1: Project Overview
**File:** `README.md`
**What to extract:**
- Business model and value proposition
- Target customer segments (ghost kitchens, food trucks, catering, ethnic grocers)
- Geographic coverage (156 cities, 15 states, tier system)
- Delivery tiers and minimum order requirements
- Success metrics and KPIs
- High-level technology stack

**Confirm you understand:**
- [ ] Why this platform exists (lead generation, not e-commerce)
- [ ] Who the customers are (underserved food service segments)
- [ ] How delivery tiers work (Hub, Tier 1 Route, Tier 2 Route, Common Carrier)
- [ ] What "resource-first" approach means (educate before selling)

---

### Step 2: Technical Architecture
**File:** `TECH_STACK.md`
**What to extract:**
- Framework choice (Astro) and why
- Complete folder structure
- All configuration files (copy these exactly)
- Database schemas for leads table
- Build strategy for 156+ pages
- Performance targets
- Security requirements

**Confirm you understand:**
- [ ] Why Astro over Next.js (zero JS default, islands architecture)
- [ ] How Supabase Edge Functions proxy external APIs
- [ ] The monorepo structure with Turborepo
- [ ] How programmatic page generation works
- [ ] Environment variables required

---

### Step 3: Design System
**File:** `DESIGN_GUIDE.md`
**What to extract:**
- Complete color system with exact hex values
- Typography scale with exact sizes
- Spacing tokens (4px grid system)
- Every component specification:
  - Buttons (sizes, variants, states)
  - Form inputs (labels, validation, errors)
  - Cards (standard, feature variants)
  - Navigation (desktop, mobile)
  - Delivery info bar
  - Trust badges
  - Multi-step form structure
- Complete Tailwind configuration
- Page layout structure for city pages
- Responsive breakpoints
- Accessibility requirements

**Confirm you understand:**
- [ ] The exact primary color is `#22c55e` (forest green)
- [ ] The exact secondary color is `#f59e0b` (warm amber)
- [ ] Typography uses Inter font with 1.25 ratio scale
- [ ] Minimum touch target is 44px
- [ ] The multi-step form has exactly 3 steps with specific fields per step

---

### Step 4: API Integrations
**File:** `API_DATA_SOURCES.md`
**What to extract:**
- All government API endpoints (USDA, EIA, BLS, USITC, Drought Monitor, FDA)
- Authentication requirements for each API
- Rate limits for each API
- Cache TTL values for each data type
- Database schema for api_cache table
- Edge Function code examples
- Commercial API options (Metals-API, Barchart, Urner Barry)
- Implementation priority by phase

**Confirm you understand:**
- [ ] USDA LMPR requires no authentication
- [ ] EIA and BLS require free API keys
- [ ] Cache TTL varies: 4 hours for USDA, 24 hours for EIA, 7 days for tariffs
- [ ] Edge Functions handle all external API calls (never call from client)

---

### Step 5: Data Storage Architecture
**File:** `DATA_STORAGE_ARCHITECTURE.md`
**What to extract:**
- Why PostgreSQL over Redis (and when Redis would be needed)
- Distinction between short-term cache vs historical storage
- Complete database schemas:
  - `protein_prices` table
  - `diesel_prices` table
  - `ppi_data` table
  - `drought_data` table
  - `api_cache` table
- Scheduled job configuration with pg_cron
- All Edge Functions for data ingestion:
  - `ingest-usda`
  - `ingest-eia`
  - `ingest-drought`
  - `backfill-usda`
- SQL queries for price comparisons and trends
- Content use cases for historical data

**Confirm you understand:**
- [ ] Historical data enables "prices down X%" messaging
- [ ] pg_cron schedules: USDA daily 5PM CT, EIA weekly Tuesday, Drought weekly Friday
- [ ] Backfill 1 year of data before launch
- [ ] Drought data correlates with protein prices 3-6 months ahead

---

### Step 6: City Landing Page Template
**File:** `CITY_TEMPLATE.md`
**What to extract:**
- Complete page structure (9 sections)
- All variable placeholders and their sources
- Delivery method variations by tier
- Value proposition variations by tier
- Content blocks for each section:
  - Hero section
  - Delivery info bar
  - Value propositions
  - Product categories
  - Local market section
  - Social proof
  - Nearby cities
  - Lead capture form
- Filled examples for Atlanta (Hub) and Tampa (Tier 1 Route)
- SEO checklist per page
- Internal linking rules

**Confirm you understand:**
- [ ] Each city page has 9 distinct sections
- [ ] Content varies by delivery tier (Hub vs Route vs Carrier)
- [ ] Minimum order is $3K for some states, $5K for others
- [ ] Each page needs 500+ words of unique content
- [ ] Schema markup uses `Service` type, not `LocalBusiness`

---

### Step 7: City Data
**File:** `city_data.json`
**What to extract:**
- All 156 cities with complete metadata
- Data structure for each city:
  - Identifiers (city, state, slug)
  - Delivery info (tier, method, frequency, lead_time, minimum_order)
  - Geography (distance, drive_time, interstate_corridors, coordinates)
  - Service area (radius, nearby_cities)
  - Institutional anchors (military, universities, hospitals, tourism)
  - Market data (population, restaurant_count, segments)
  - Compliance (eco_emphasis by state)

**Confirm you understand:**
- [ ] There are exactly 156 cities
- [ ] Tier distribution: 1 Hub, 63 Tier1_Route, 32 Tier2_Route, 60 Common_Carrier
- [ ] State distribution across 15 states
- [ ] Data completeness for each city

---

### Step 8: Implementation Checklist
**File:** `IMPLEMENTATION_CHECKLIST.md`
**What to extract:**
- Phase breakdown with week assignments
- Specific tasks within each phase
- Testing requirements
- Environment variables list
- Launch checklist

**Confirm you understand:**
- [ ] Phase 1 is foundation (Weeks 1-2)
- [ ] Phase 2 is calculators/tools (Weeks 3-4)
- [ ] Phase 3 is location pages (Weeks 5-8)
- [ ] Phase 4 is optimization (Weeks 9-12)

---

## After Reading: Create Your Build Plan

Once you have read ALL documents completely, create a detailed build plan with the following structure:

### Build Plan Template

```markdown
# Food Service Platform Build Plan

## Phase 1: Foundation (Weeks 1-2)

### Week 1, Days 1-2: Project Initialization
- [ ] Task 1: [specific action]
- [ ] Task 2: [specific action]
- Dependencies: [list]
- Deliverables: [list]
- Verification: [how to confirm completion]

### Week 1, Days 3-5: [Next milestone]
...

## Phase 2: API & Data Layer (Weeks 3-4)
...

## Phase 3: Location Pages (Weeks 5-8)
...

## Phase 4: Optimization (Weeks 9-12)
...
```

### Required Build Plan Sections

Your build plan MUST include:

1. **Dependency Graph**
   - What must be built before what
   - Parallel workstreams that can happen simultaneously
   - Critical path items

2. **Database Migrations Order**
   - List every table in creation order
   - Include all indexes
   - Include all RLS policies

3. **Edge Functions List**
   - Every Edge Function to be created
   - Its purpose
   - Its dependencies (tables, APIs)

4. **Component Inventory**
   - Every UI component from DESIGN_GUIDE.md
   - Mapped to which pages use it
   - Build priority

5. **API Integration Sequence**
   - Which APIs to integrate first
   - Testing strategy for each
   - Fallback behavior if API fails

6. **Content Generation Plan**
   - How to generate 156 city pages
   - Template system approach
   - Unique content strategy per page

7. **Testing Checkpoints**
   - End of each week verification
   - What "done" looks like for each phase

---

## Execution Rules

### When Building Components

1. Reference `DESIGN_GUIDE.md` for exact specifications
2. Use the exact color values, spacing tokens, and typography
3. Implement all states (default, hover, focus, disabled, error)
4. Test at all breakpoints (640px, 768px, 1024px, 1280px)
5. Verify accessibility (keyboard nav, screen reader, contrast)

### When Building API Integrations

1. Reference `API_DATA_SOURCES.md` for endpoints and auth
2. Reference `DATA_STORAGE_ARCHITECTURE.md` for caching strategy
3. Always use Edge Functions (never client-side API calls)
4. Implement error handling and fallbacks
5. Log API usage for rate limit monitoring

### When Building Pages

1. Reference `CITY_TEMPLATE.md` for structure
2. Reference `city_data.json` for city-specific data
3. Implement all 9 sections per page
4. Verify internal linking to nearby cities
5. Check SEO requirements (meta, schema, canonical)

### When Building Forms

1. Reference `DESIGN_GUIDE.md` multi-step form specification
2. Implement Zod validation schemas
3. Handle all error states
4. Implement progressive disclosure (3 steps)
5. Add hidden honeypot field for spam prevention

---

## Verification Checklist

Before considering any phase complete, verify:

### Phase 1 Verification
- [ ] `pnpm install` runs without errors
- [ ] `pnpm dev` starts Astro dev server
- [ ] Supabase local instance runs
- [ ] All database tables created
- [ ] Lead form submits to Supabase
- [ ] Notification triggers on lead submission
- [ ] Homepage renders correctly
- [ ] At least 1 city page renders correctly

### Phase 2 Verification
- [ ] USDA Edge Function returns cached data
- [ ] EIA Edge Function returns diesel prices
- [ ] Pricing calculator displays real data
- [ ] Historical data backfill completed (1 year)
- [ ] pg_cron jobs scheduled
- [ ] Price comparison queries work

### Phase 3 Verification
- [ ] All 156 city pages generate
- [ ] Each page has unique H1, title, description
- [ ] Internal links work (nearby cities, state hub)
- [ ] Schema markup validates
- [ ] Sitemap includes all pages
- [ ] Build time under 2 minutes

### Phase 4 Verification
- [ ] Lighthouse score 90+ on all Core Web Vitals
- [ ] Forms convert (test submissions)
- [ ] Analytics tracking fires
- [ ] Error monitoring captures issues
- [ ] Mobile experience smooth

---

## File Locations Summary

All documentation files are in `/mnt/user-data/outputs/`:

| File | Size | Purpose |
|------|------|---------|
| `README.md` | 9KB | Project overview, business model |
| `TECH_STACK.md` | 25KB | Architecture, configs, structure |
| `DESIGN_GUIDE.md` | 29KB | Complete UI/UX specifications |
| `API_DATA_SOURCES.md` | 20KB | API endpoints, caching, Edge Functions |
| `DATA_STORAGE_ARCHITECTURE.md` | 18KB | Historical storage, pg_cron, ingestion |
| `CITY_TEMPLATE.md` | 40KB | Landing page template, examples |
| `IMPLEMENTATION_CHECKLIST.md` | 9KB | Phase breakdown, tasks |
| `city_data.json` | 104KB | All 156 cities with metadata |

**Total documentation: ~254KB**

---

## Begin

Now read each document in order, completely, extracting all details. Do not skip sections. Do not summarize until you have read everything.

After reading all documents:
1. Confirm your understanding of each document
2. Create the detailed build plan
3. Identify any ambiguities or questions
4. Begin Phase 1 implementation

**Start with:** `README.md`
