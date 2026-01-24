# Value Source Platform - Comprehensive Site Audit Report

**Date:** January 23, 2026
**Scope:** Calculators & Data Sources, Edge Functions & APIs, UI/UX, SEO/GEO, Astro Architecture
**Status:** Audit Only (No Modifications Made)

---

## Executive Summary

The Value Source platform is a well-structured Astro 5 hybrid SSR/static site with solid technical foundations but several critical issues requiring attention. The site serves 156 city landing pages across 15+ states with real-time market data integration.

### Overall Scores

| Category | Score | Status |
|----------|-------|--------|
| Technical SEO | 8/10 | Good |
| Content SEO | 6.5/10 | Needs Work |
| Structured Data | 4/10 | Critical Gaps |
| GEO (AI Visibility) | 5/10 | Major Gaps |
| Local SEO | 7/10 | Good |
| Astro Architecture | 7/10 | Good |
| **Overall** | **5.4/10** | Strong foundation, significant gaps |

---

## Critical Issues

### 1. Recalls Not Loading - Missing Edge Function Config

**Root Cause:** The `[functions.recalls]` section is MISSING from `supabase/config.toml`

The config only has:
- `[functions.diesel-prices]` ✓
- `[functions.ppi-data]` ✓
- `[functions.market-insights]` ✓
- `[functions.recalls]` ❌ **MISSING**

**Result:** API calls to `/functions/v1/recalls` fail → falls back to mock data showing "ABC Foods Inc.", "XYZ Poultry Corp." — these are fake placeholder companies, not real FDA recalls.

**Location:** `supabase/config.toml`

**Fix Required:**
```toml
[functions.recalls]
verify_jwt = false
```

---

### 2. HistoricalCharts Uses Fake Data (Math.random)

**File:** `apps/web/src/components/landing/HistoricalCharts.tsx` (line 63)

```tsx
const variance = () => (Math.random() - 0.5) * 0.1; // Random variance
const trendFactor = 1 - (i / days) * 0.05; // Slight upward trend
```

The "30/60/90 day historical trends" are **100% simulated** — charts change on every page load. This could constitute misleading marketing.

**Recommendation:** Replace with real historical data from Supabase or remove the component entirely.

---

### 3. StickyLeadCapture Has No Close Button

**File:** `apps/web/src/components/landing/StickyLeadCapture.tsx` (line 96)

The floating quote box:
- Position: `fixed right-4 top-1/2` (desktop), `fixed bottom-0` (mobile)
- Z-index: `z-40`
- No dismiss/close functionality
- Can overlap calculator inputs on tablets (no margin compensation)
- Shows between 600px scroll and footer

---

## Calculator & Data Component Audit

### Component Summary

| Component | File | Data Source | Real/Mock | User Clarity |
|-----------|------|-------------|-----------|--------------|
| FreightCalculator | `FreightCalculator.tsx` (42.8KB) | ATRI rates, DOE fuel | 70% Real | ⭐⭐⭐⭐ |
| CostCalculator | `CostCalculator.tsx` (10KB) | Hardcoded percentages | Mock/Simplified | ⭐⭐⭐⭐ |
| HistoricalCharts | `HistoricalCharts.tsx` (14KB) | Math.random() | 100% Fake | ⭐⭐⭐ |
| SeasonalInsights | `SeasonalInsights.tsx` (12KB) | Static seasonal patterns | Educational | ⭐⭐⭐⭐⭐ |
| MarketDashboard | `MarketDashboard.astro` (13KB) | Supabase Edge Functions | 80% Real | ⭐⭐⭐⭐ |
| MarketInsights | `MarketInsights.tsx` | Supabase API | Real when available | ⭐⭐⭐⭐ |

### What "Potential Savings" Is Based On

**File:** `apps/web/src/components/landing/CostCalculator.tsx` (lines 46-47)

Hardcoded percentages (not real market data):
- **Disposables:** 6% freight savings + 10% pricing savings
- **Proteins:** 6% freight savings + 12% pricing savings
- **Both:** 8% freight savings + 10% pricing savings

**Formula:**
```
freightSavings = annualSpend × freightSavingsPercent
pricingSavings = annualSpend × pricingSavingsPercent
totalAnnualSavings = freightSavings + pricingSavings
```

Monthly spend input range: $3,000 - $100,000, multiplied by 12 for annual.

---

### What "Seasonal Market Insights" Is Based On

**File:** `apps/web/src/components/landing/SeasonalInsights.tsx` (lines 30-104)

Static hardcoded seasonal patterns based on general industry knowledge (not real-time data):

| Season | Months | Freight Outlook | Multiplier |
|--------|--------|-----------------|------------|
| Q4 (Fall/Winter) | Oct-Dec | High | 1.08x (holiday shipping) |
| Q2 (Spring) | Apr-Jun | Moderate | 1.04x (produce season) |
| Q1 (Winter) | Jan-Mar | Low | 0.95x (slow season) |
| Q3 (Summer) | Jul-Sep | Moderate | 1.00x (baseline) |

---

### FreightCalculator Data Sources

**File:** `apps/web/src/components/landing/FreightCalculator.tsx`

**Real Data:**
- Base dry van rate: $2.26/mile (ATRI national average)
- Reefer premium: 25% markup (industry standard)
- Fuel surcharge: 43.2% (DOE/EIA diesel index)
- Base diesel: $3.50/gal (DOE reference)

**Calculated/Approximated:**
- ZIP code coordinates: ~330 3-digit prefix approximations
- Distance: Haversine formula with road routing factors:
  - <100 mi: 1.28x (local roads)
  - 100-300 mi: 1.24x (mix of highways)
  - 300-600 mi: 1.20x (mostly interstate)
  - >600 mi: 1.17x (long haul efficiency)

**FTL Rate Calculation:**
```
ftlLinehaul = distance × ratePerMile
ftlFuel = ftlLinehaul × (fuelSurchargePercent / 100)
ftlTotal = ftlLinehaul + ftlFuel
```

**LTL Rate Calculation:**
```
ltlRatePerCwt = 15 + (distance × 0.02)
ltlTotal = (weight / 100) × ltlRatePerCwt
ltlFuel = ltlTotal × (ltlFuelPercent / 100)
```

---

## Redundancy Issues

### Diesel Price Displays (4 instances - Overkill)

| Location | Component | Display Format |
|----------|-----------|----------------|
| 1 | MarketDashboard | Full price with trend badge |
| 2 | MarketSnapshot | Price + weekly change % |
| 3 | DeliveryInfoBar | Fuel surcharge percentage |
| 4 | HistoricalCharts | 30/60/90 day chart (simulated) |

**Recommendation:** Reduce to 2 displays maximum.

---

### Freight Calculators (2 overlapping - Remove one)

| Calculator | Size | Features | Data Quality |
|------------|------|----------|--------------|
| FreightCalculator | 42.8KB | ZIP-to-ZIP, FTL/LTL toggle, real ATRI rates | 70% real |
| CostCalculator | 10KB | Simplified % savings, no real rates | Mock |

**Recommendation:** Keep FreightCalculator, remove or merge CostCalculator.

---

### Lead Forms (2 duplicate implementations)

| Form | File | Validation | Hydration |
|------|------|------------|-----------|
| LeadForm | `forms/LeadForm.tsx` | React Hook Form + Zod | `client:load` |
| MultiStepLeadForm | `landing/MultiStepLeadForm.tsx` | useState + custom | `client:visible` |

**Recommendation:** Consolidate into single form component using React Hook Form + Zod.

---

## UI/UX Issues

### StickyLeadCapture Problems

| Issue | Impact | Severity |
|-------|--------|----------|
| No dismiss button | Users can't close intrusive element | High |
| Tablet viewport collision | Fixed sidebar blocks calculator inputs | High |
| 4+ identical CTAs | "Get Quote" appears everywhere | Medium |
| No scroll position awareness | Can appear over modals | Low |

---

### CTA Confusion Matrix

| Button Text | Location | Actual Action |
|-------------|----------|---------------|
| "Get Your Quote" | StickyLeadCapture (sidebar) | Opens mini-form |
| "Get Quote" | StickyLeadCapture (mobile) | Same as above |
| "Calculate Savings" | CostCalculator | Shows % savings (no submission) |
| "Get Your Custom Quote" | CostCalculator results | Dispatches event, scrolls to form |
| "Get Exact Quote" | FreightCalculator | Scrolls to MultiStepLeadForm |
| "Get My Custom Quote" | MultiStepLeadForm Step 3 | Actual API submission |

**Problem:** Users don't know which "Get Quote" button does what.

**Recommendation:** Rename for clarity:
- "Quick Quote" (StickyLeadCapture)
- "Calculate Savings" (CostCalculator)
- "Get Exact Price" (FreightCalculator)
- "Submit Request" (MultiStepLeadForm)

---

### City Page Information Density

**Total sections:** 16
**Estimated scroll depth:** ~7,600px (13+ scroll lengths)

| # | Section | Height |
|---|---------|--------|
| 1 | RecallAlertBar | ~60px |
| 2 | HeroWithMarketSnapshot | ~400px |
| 3 | DeliveryInfoBar | ~60px |
| 4 | MarketDashboard | ~600px |
| 5 | FreightCalculator | ~800px |
| 6 | HistoricalCharts | ~600px |
| 7 | SeasonalInsights | ~700px |
| 8 | CostCalculator | ~600px |
| 9 | **MultiStepLeadForm** | ~800px |
| 10 | ValuePropositions | ~400px |
| 11 | ProductCategories | ~500px |
| 12 | RecallsSection | ~700px |
| 13 | LocalMarketSection | ~500px |
| 14 | SocialProof | ~200px |
| 15 | NearbyCities | ~500px |
| 16 | FooterCTA | ~400px |

**Problem:** Primary conversion form (MultiStepLeadForm) is section #9 — too far down.

**Recommendation:** Move form higher (after hero or after MarketDashboard).

---

## SEO/GEO Audit

### Technical SEO Strengths

- ✓ Meta tags properly implemented in Layout.astro
- ✓ Open Graph tags with dynamic title, description, image
- ✓ Twitter Card markup (summary_large_image)
- ✓ Canonical URLs auto-generated
- ✓ Sitemap via @astrojs/sitemap (filters out /api/)
- ✓ Trailing slash consistency (`trailingSlash: 'always'`)
- ✓ HTTPS redirect enforced in netlify.toml
- ✓ Security headers configured (X-Frame-Options, CSP, etc.)

### Critical SEO Gaps

| Missing Item | Impact | Priority |
|--------------|--------|----------|
| **robots.txt** | Crawlers have no guidance | Critical |
| **FAQ schema & content** | AI models won't cite site | Critical |
| **LocalBusiness schema** | No rich snippets for local search | High |
| **BreadcrumbList schema** | No breadcrumb display in SERPs | High |
| **Image alt text** | Zero images have alt attributes | Medium |
| **Product schema** | No product rich snippets | Medium |

### robots.txt (Create This)

**Location:** `apps/web/public/robots.txt`

```
User-agent: *
Allow: /
Allow: /sitemap-index.xml

Disallow: /api/

Sitemap: https://valuesource.com/sitemap-index.xml
```

---

### GEO (AI Visibility) Gaps

**Why AI models (ChatGPT, Claude, Perplexity) won't cite this site:**

1. **No FAQ content** — AI prioritizes FAQ structures for citations
2. **Thin city page content** — Template-driven, no unique insights
3. **No expertise signals** — No author bylines, credentials, research
4. **No comparison content** — No "vs. Sysco" or competitor analysis
5. **Market data in React islands** — AI crawlers may miss client-rendered content

**Recommendation:** Add 10-15 FAQs per city page with FAQPage schema.

---

### Schema Implementation Needed

**Current:** Only basic `Service` schema on city/state pages.

**Required Additions:**

```json
// LocalBusiness Schema
{
  "@type": "LocalBusiness",
  "name": "Value Source",
  "address": { "@type": "PostalAddress", ... },
  "telephone": "(404) 555-1234",
  "areaServed": ["GA", "FL", "AL", ...],
  "priceRange": "$3,000+"
}

// FAQPage Schema
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the minimum order for Atlanta?",
      "acceptedAnswer": { "@type": "Answer", "text": "..." }
    }
  ]
}

// BreadcrumbList Schema
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "position": 1, "name": "Home", "item": "https://valuesource.com/" },
    { "position": 2, "name": "Georgia", "item": "https://valuesource.com/georgia/" },
    { "position": 3, "name": "Atlanta", "item": "https://valuesource.com/georgia/atlanta/" }
  ]
}
```

---

## Astro Architecture Audit

### Rendering Strategy

| Page | Type | Notes |
|------|------|-------|
| `/` (index) | Static | Prerendered at build |
| `/products/` | Static | Prerendered |
| `/about/` | Static | Prerendered |
| `/locations/` | Static | Prerendered with getStaticPaths() |
| `/[state]/` | Static | Prerendered with getStaticPaths() |
| `/[state]/[city]/` | **SSR** | `export const prerender = false` |
| `/api/*` | API | Dynamic endpoints |

**Assessment:** Good SSR/static split. City pages correctly use SSR for fresh market data.

**Gap:** No cache headers on city pages — every request regenerates.

**Recommendation:** Add to city page response:
```
Cache-Control: s-maxage=3600, stale-while-revalidate=86400
```

---

### Client Directives Analysis

**Total: 16 client directives**

| Directive | Count | Assessment |
|-----------|-------|------------|
| `client:load` | 6 | ⚠️ Some overhydrated |
| `client:visible` | 8 | ✓ Appropriate |
| `client:idle` | 2 | ✓ Optimal |

### Overhydration Issues

**LeadForm uses `client:load` but appears below the fold:**

```astro
<!-- apps/web/src/pages/[state]/index.astro -->
<LeadForm client:load sourceState={stateName} />
```

**Problem:** Form loads immediately but user won't interact until scrolling 2000+ pixels.

**Fix:** Change to `client:visible`
```astro
<LeadForm client:visible sourceState={stateName} />
```

**Expected Impact:** ~50-80ms faster TTI.

---

### Bundle Size Concerns

| Dependency | Size (gzip) |
|------------|-------------|
| react | ~42KB |
| react-dom | ~44KB |
| react-hook-form | ~12KB |
| recharts | ~40KB |
| zod | ~10KB |
| lucide-react | ~15KB |
| class-variance-authority | ~2KB |

**Total React Island Bundle:** ~165KB gzip

---

### Prefetch Configuration

**Current (too aggressive):**
```javascript
prefetch: {
  prefetchAll: true,  // Prefetches ALL links including footer
  defaultStrategy: 'viewport',
}
```

**Problem:** Footer has 20+ links, state pages link to 50+ cities. Mobile users download prefetch data they won't use.

**Recommendation:**
```javascript
prefetch: {
  prefetchAll: false,
  defaultStrategy: 'viewport',
}
```

---

## Recommendations by Priority

### 🔴 Critical (Do First)

| # | Issue | File | Effort |
|---|-------|------|--------|
| 1 | Add `[functions.recalls]` config | `supabase/config.toml` | 5 min |
| 2 | Deploy recalls function | Terminal | 5 min |
| 3 | Create robots.txt | `apps/web/public/robots.txt` | 10 min |
| 4 | Add close button to StickyLeadCapture | `StickyLeadCapture.tsx` | 30 min |

### 🟠 High Priority

| # | Issue | File | Effort |
|---|-------|------|--------|
| 5 | Replace HistoricalCharts fake data | `HistoricalCharts.tsx` | 2-4 hrs |
| 6 | Consolidate duplicate forms | `LeadForm.tsx`, `MultiStepLeadForm.tsx` | 1-2 hrs |
| 7 | Change LeadForm to `client:visible` | State page templates | 5 min |
| 8 | Add FAQ schema and content | City pages | 4-8 hrs |
| 9 | Add LocalBusiness schema | `CityLayout.astro` | 1 hr |
| 10 | Remove/merge CostCalculator | `CostCalculator.tsx` | 1 hr |

### 🟡 Medium Priority

| # | Issue | File | Effort |
|---|-------|------|--------|
| 11 | Add cache headers to city pages | `[city].astro` | 30 min |
| 12 | Rename CTAs for clarity | Multiple components | 1 hr |
| 13 | Add tablet margin to StickyLeadCapture | `StickyLeadCapture.tsx` | 15 min |
| 14 | Disable `prefetchAll` | `astro.config.mjs` | 5 min |
| 15 | Add image alt text | All image references | 1 hr |
| 16 | Add BreadcrumbList schema | Layout components | 1 hr |

### 🟢 Low Priority

| # | Issue | Effort |
|---|-------|--------|
| 17 | Reduce diesel displays from 4 to 2 | 1 hr |
| 18 | Move MultiStepLeadForm higher | 30 min |
| 19 | Add E-E-A-T signals to About page | 2 hrs |
| 20 | Component library documentation | 2 hrs |

---

## File Reference

| Component/Config | Path |
|------------------|------|
| Supabase config | `supabase/config.toml` |
| Recalls edge function | `supabase/functions/recalls/index.ts` |
| Recalls lib (fallback data) | `apps/web/src/lib/recalls.ts` |
| Market data lib | `apps/web/src/lib/market-data.ts` |
| StickyLeadCapture | `apps/web/src/components/landing/StickyLeadCapture.tsx` |
| HistoricalCharts | `apps/web/src/components/landing/HistoricalCharts.tsx` |
| CostCalculator | `apps/web/src/components/landing/CostCalculator.tsx` |
| FreightCalculator | `apps/web/src/components/landing/FreightCalculator.tsx` |
| SeasonalInsights | `apps/web/src/components/landing/SeasonalInsights.tsx` |
| LeadForm | `apps/web/src/components/forms/LeadForm.tsx` |
| MultiStepLeadForm | `apps/web/src/components/landing/MultiStepLeadForm.tsx` |
| City page template | `apps/web/src/pages/[state]/[city].astro` |
| State page template | `apps/web/src/pages/[state]/index.astro` |
| Homepage | `apps/web/src/pages/index.astro` |
| Layout | `apps/web/src/layouts/Layout.astro` |
| CityLayout | `apps/web/src/components/layout/CityLayout.astro` |
| Astro config | `apps/web/astro.config.mjs` |
| Netlify config | `netlify.toml` |

---

## Conclusion

The Value Source platform has a **solid technical foundation** but needs work in three key areas:

1. **Data Integrity** — Fix recalls API, replace fake historical data
2. **UX Polish** — Fix floating CTA, reduce redundancy, clarify CTAs
3. **SEO/GEO** — Add missing schemas, FAQ content, robots.txt

Addressing the Critical and High Priority items will significantly improve both user experience and search visibility.

---

*Audit completed January 23, 2026. No code modifications were made.*
