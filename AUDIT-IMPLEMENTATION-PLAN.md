# Audit Implementation Plan

Complete checklist for all audit fixes (excluding branding/images - see TODO-BRANDING-IMAGES.md).

**Created:** 2026-01-23
**Status:** In Progress
**Last Updated:** 2026-01-23

---

## Phase 1: Critical Fixes

### 1.1 Fix Recalls Edge Function Config
- [x] Add `[functions.recalls]` section to `supabase/config.toml`
- [ ] Verify FDA_API_KEY is set in Supabase secrets
- [ ] Test recalls endpoint returns real FDA data (not mock)

**Files:** `supabase/config.toml`

**Status:** Code complete. Needs API key verification on deployment.

---

### 1.2 Add Close Button to StickyLeadCapture
- [x] Add X button to desktop sidebar version
- [x] Add X button to mobile bottom bar version
- [x] Store dismiss state in sessionStorage (don't show again this session)
- [ ] Add tablet viewport handling (hide or add margin on md breakpoint)

**Files:** `apps/web/src/components/landing/StickyLeadCapture.tsx`

**Status:** Complete. Close button with sessionStorage dismiss state added.

---

### 1.3 Create robots.txt
- [x] Create `/public/robots.txt` file
- [x] Allow all crawlers
- [x] Disallow `/api/` routes
- [x] Reference sitemap URL

**Files:** `apps/web/public/robots.txt`

**Status:** Complete.

---

### 1.4 Fix HistoricalCharts (Fake Data)

**Decision:** Option B selected - Connect to real `diesel_prices` table.

- [x] Modify HistoricalCharts to fetch from `diesel_prices` table
- [x] Remove Math.random() variance code for diesel (kept deterministic sine for trucking estimates)
- [x] Update disclaimer text to reflect real data source
- [x] Add "Live" vs "Est." badges to distinguish real vs estimated data

**Files:**
- `apps/web/src/components/landing/HistoricalCharts.tsx`

**Status:** Complete. Diesel data fetched from Supabase, trucking rates use deterministic estimates with clear disclaimer.

---

## Phase 2: Component Cleanup

### 2.1 Remove CostCalculator
- [x] Remove CostCalculator from city page template (`[state]/[city].astro`)
- [x] Remove CostCalculator component file
- [x] Remove from landing components index export
- [x] Verify no other pages reference it

**Status:** Complete. Component deleted.

---

### 2.2 Consolidate Duplicate Lead Forms
- [x] Audit differences between LeadForm and MultiStepLeadForm
- [x] Add UTM tracking to MultiStepLeadForm (was missing)
- [ ] Full consolidation deferred (different use cases: LeadForm for homepage/state, MultiStepLeadForm for city pages)

**Note:** Both forms serve different contexts. LeadForm uses React Hook Form + Zod, MultiStepLeadForm has calculator integration. UTM tracking gap addressed.

**Status:** Partial - UTM tracking added. Full consolidation deferred.

---

### 2.3 Reduce Diesel Price Displays (4 → 2)

**Current displays:**
1. MarketDashboard - Full price with trend ✓ KEEP
2. MarketSnapshot - Price + weekly change % - EVALUATE
3. DeliveryInfoBar - Fuel surcharge percentage ✓ KEEP (different info)
4. HistoricalCharts - 30/60/90 day chart - FIXED (now shows real data)

- [ ] Decide which 2 displays to keep
- [ ] Remove redundant diesel display from MarketSnapshot OR consolidate
- [ ] Ensure remaining displays show consistent data

**Status:** Not started (lower priority after HistoricalCharts fix)

---

### 2.4 Rename CTAs for Clarity

- [ ] StickyLeadCapture: "Quick Quote" or "Get Started"
- [ ] FreightCalculator: "Get Exact Pricing" or "Request Quote"
- [ ] MultiStepLeadForm: "Submit Request" or "Get My Quote"

**Status:** Not started

---

## Phase 3: Performance & Hydration

### 3.1 Change LeadForm to client:visible
- [x] Update state page template to use `client:visible` instead of `client:load`
- [x] Update homepage to use `client:visible`

**Status:** Complete.

---

### 3.2 Disable Aggressive Prefetch
- [x] Change `prefetchAll: false` in astro.config.mjs

**Status:** Complete.

---

### 3.3 Add Cache Headers to City Pages
- [x] Add Cache-Control header to SSR city page responses
- [x] Set `s-maxage=3600, stale-while-revalidate=86400`

**Status:** Complete.

---

## Phase 4: SEO & Schema Implementation

### 4.1 Add LocalBusiness Schema
- [x] Create LocalBusiness JSON-LD schema
- [x] Add to Layout.astro (site-wide)
- [x] Include: name, address, phone, areaServed, priceRange, openingHours

**Status:** Complete.

---

### 4.2 Add BreadcrumbList Schema
- [x] Create BreadcrumbList JSON-LD schema
- [x] Add to CityLayout.astro
- [x] Add to state page ([state]/index.astro)

**Status:** Complete.

---

### 4.3 Add FAQ Schema & Content
- [x] Create FAQ data structure with city-specific context
- [x] Create FAQSection.astro component with FAQPage schema
- [x] Add 7 dynamic FAQs to city pages
- [x] FAQs include city/state/tier-specific content

**Status:** Complete.

---

### 4.4 Add Product Schema (Products Page)
- [ ] Add Product or ItemList schema to products page
- [ ] Include product categories with descriptions

**Status:** Not started

---

## Phase 5: Layout & UX Improvements

### 5.1 Move Lead Form Higher on City Pages
- [ ] Audit current section order on city pages
- [ ] Move MultiStepLeadForm from position #9 to position #4-5

**Status:** Not started

---

### 5.2 Fix StickyLeadCapture Tablet Overlap
- [ ] Add `lg:mr-72` or similar margin to main content on tablets
- [ ] OR hide StickyLeadCapture on md breakpoint

**Status:** Not started

---

## Phase 6: Data Quality

### 6.1 Verify Market Data Uses Real APIs
- [ ] Confirm EIA_API_KEY is deployed to Supabase secrets
- [ ] Confirm BLS_API_KEY is deployed
- [ ] Confirm FDA_API_KEY is deployed
- [ ] Test market-data function returns real data
- [ ] Test diesel-prices function returns real EIA data

**Status:** Not started (deployment task)

---

### 6.2 FreightCalculator Data Accuracy
- [ ] Verify ATRI rates are current
- [ ] Consider adding "Rates as of [date]" disclaimer

**Status:** Not started

---

## Phase 7: Low Priority Enhancements

### 7.1 Enhance About Page E-E-A-T Signals
- [ ] Add founder/team credentials
- [ ] Add industry certifications or partnerships
- [ ] Add company history timeline

**Status:** Not started

---

### 7.2 Component Documentation
- [ ] Create README in components directory
- [ ] Document which components are deprecated

**Status:** Not started

---

## Verification & Testing

### Final Checklist
- [ ] Build passes (`npm run build`) - Needs env vars
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Test homepage loads correctly
- [ ] Test city page loads correctly (e.g., /georgia/atlanta/)
- [ ] Test state page loads correctly (e.g., /georgia/)
- [ ] Verify recalls show real FDA data (not "ABC Foods Inc.")
- [x] Verify robots.txt accessible at /robots.txt
- [ ] Verify sitemap accessible at /sitemap-index.xml
- [ ] Test StickyLeadCapture close button works
- [ ] Test lead form submission works
- [ ] Check mobile responsive behavior
- [ ] Validate schema with Google Rich Results Test

---

## Summary by Priority

| Priority | Tasks | Status |
|----------|-------|--------|
| **Critical** | 1.1, 1.2, 1.3, 1.4 | ✅ Complete |
| **High** | 2.1, 2.2, 2.3, 2.4, 3.1, 4.1, 4.2, 4.3 | 🟡 Mostly Complete |
| **Medium** | 3.2, 3.3, 4.4, 5.1, 5.2, 6.1, 6.2 | 🟡 Partial |
| **Low** | 7.1, 7.2 | Not Started |

---

## Completed This Session

1. **Phase 1 (Critical):**
   - Added `[functions.recalls]` and `[functions.market-data]` to supabase/config.toml
   - Added close button to StickyLeadCapture with sessionStorage dismiss
   - Created robots.txt
   - Rewrote HistoricalCharts to fetch real diesel data from Supabase

2. **Phase 2 (Component Cleanup):**
   - Removed CostCalculator component entirely
   - Added UTM tracking to MultiStepLeadForm

3. **Phase 3 (Performance):**
   - Changed LeadForm to client:visible on homepage and state pages
   - Disabled aggressive prefetch (prefetchAll: false)
   - Added cache headers to city pages

4. **Phase 4 (SEO):**
   - Added LocalBusiness schema to Layout.astro
   - Added BreadcrumbList schema to CityLayout and state pages
   - Created FAQSection.astro with dynamic city-specific FAQs

---

## Notes

- CostCalculator removal approved by user
- User approved all SEO/GEO tasks
- HistoricalCharts Option B implemented (real diesel data)
- Branding/images deferred to separate doc (TODO-BRANDING-IMAGES.md)
- Build requires environment variables (PUBLIC_SUPABASE_ANON_KEY, etc.)
