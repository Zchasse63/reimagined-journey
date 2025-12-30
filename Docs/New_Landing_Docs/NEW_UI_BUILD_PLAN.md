# NEW UI BUILD PLAN: Information-First Landing Page Restructure

**Version:** 2.0
**Created:** December 30, 2025
**Status:** Ready for Implementation
**Supersedes:** Original BUILD_PLAN.md UI sections

---

## Executive Summary

### Why This Plan Exists

The original landing page implementation followed a traditional "brochure" pattern that underperformed:

| Problem | Impact |
|---------|--------|
| Lead form buried in Section 9 (bottom) | Low conversion - users leave before reaching it |
| Zero market intelligence visible | No reason for visitors to return; no SEO freshness signals |
| No interactive tools | No lead qualification or engagement before form |
| Static content only | Page functions as brochure, not resource |

### The New Philosophy: Information-First Lead Generation

**OLD Approach:** "Here's who we are → Here's what we do → Fill out this form"

**NEW Approach:** "Here's valuable market data → Here's tools to help you → Get personalized insights"

This transforms the page from a vendor brochure into an **industry resource** that:
- Delivers value immediately (commodity prices, recall alerts)
- Provides interactive tools (cost calculator)
- Captures leads at multiple friction levels
- Gives operators reasons to bookmark and return
- Triggers Google's "Query Deserves Freshness" algorithm

**Target Outcomes:**
- Form conversion: 8-12% (vs. ~2-3% current estimate)
- Email capture rate: 5-8% (from micro-captures)
- Return visitor rate: 10-15%

---

## Structure Comparison: Current vs. New

```
CURRENT STRUCTURE (Underperforming)     NEW STRUCTURE (Information-First)
═══════════════════════════════════     ═════════════════════════════════

1. Hero Section                         1. RECALL ALERT BAR ← NEW
2. Delivery Info Bar                    2. HERO + MARKET SNAPSHOT ← ENHANCED
3. Value Props Section                  3. DELIVERY INFO BAR ← ENHANCED
4. Product Categories                   4. MARKET INTELLIGENCE DASHBOARD ← NEW
5. Local Market Section                 5. COST CALCULATOR ← NEW
6. Market Insights (basic)              6. PRIMARY LEAD FORM ← MOVED UP!
7. Social Proof                         7. VALUE PROPOSITIONS ← MOVED DOWN
8. Nearby Cities                        8. PRODUCT CATEGORIES
9. Lead Form Section ← TOO LATE!        9. ACTIVE RECALLS SECTION ← NEW
                                       10. LOCAL MARKET SECTION
                                       11. SOCIAL PROOF
                                       12. NEARBY CITIES
                                       13. FOOTER CTA

                                       PERSISTENT ELEMENTS:
                                       • Sticky sidebar/bottom bar
                                       • Exit intent popup
```

### Key Changes Explained

| Change | Rationale |
|--------|-----------|
| Recall Alert Bar at top | Establishes trust immediately; food safety is non-negotiable |
| Market Snapshot in hero | Delivers value in first 3 seconds; proves we're a resource |
| Market Dashboard (Section 4) | Main traffic driver; fresh content for SEO and return visits |
| Cost Calculator (Section 5) | Interactive engagement; pre-qualifies leads through inputs |
| Lead Form moved to Section 6 | Positioned AFTER value demonstrated, not buried at bottom |
| Value Props moved down | Now supports the ask rather than delaying it |
| 5 lead capture points | Multiple friction levels capture different intent levels |

---

## Component Inventory

### New Components to Build

| Component | Type | Purpose | Priority |
|-----------|------|---------|----------|
| `RecallAlertBar.astro` | Astro | Sticky top banner for active recalls | HIGH |
| `HeroWithMarketSnapshot.astro` | Astro | Split hero with market data card | HIGH |
| `MarketSnapshot.astro` | Astro | Live prices card in hero | HIGH |
| `MarketDashboard.astro` | Astro | Full market intelligence section | HIGH |
| `CommodityCard.astro` | Astro | Individual commodity price card | HIGH |
| `CostCalculator.tsx` | React | Interactive savings calculator | HIGH |
| `MultiStepLeadForm.tsx` | React | 3-step conversion form | CRITICAL |
| `RecallsSection.astro` | Astro | Full recall details section | MEDIUM |
| `RecallCard.astro` | Astro | Individual recall display | MEDIUM |
| `MicroEmailCapture.astro` | Astro | Inline email-only capture | HIGH |
| `StickyLeadCapture.tsx` | React | Persistent CTA sidebar/bar | MEDIUM |
| `ExitIntentPopup.tsx` | React | Exit intent modal | LOW |
| `FooterCTA.astro` | Astro | Final conversion section | LOW |

### Components to Modify

| Component | Current Location | Modification Needed |
|-----------|-----------------|---------------------|
| `[city].astro` | `apps/web/src/pages/[state]/[city].astro` | Complete restructure with new section order |
| `DeliveryInfoBar` | Inline in city page | Extract to component, add fuel surcharge |
| `MarketInsights.tsx` | `apps/web/src/components/market/` | Enhance or replace with MarketDashboard |
| `LeadForm.tsx` | `apps/web/src/components/forms/` | Upgrade to MultiStepLeadForm with calculator integration |

### Existing Components to Reuse

| Component | Notes |
|-----------|-------|
| `Button`, `Card`, `Input`, etc. | shadcn/ui components - keep as-is |
| `Header.astro`, `Footer.astro` | Layout components - keep as-is |
| `CityLayout.astro` | May need minor updates for new persistent elements |
| Form step components | Refactor into new MultiStepLeadForm |

---

## New File Structure

```
apps/web/src/
├── components/
│   ├── landing/                    ← NEW DIRECTORY
│   │   ├── RecallAlertBar.astro
│   │   ├── HeroWithMarketSnapshot.astro
│   │   ├── MarketSnapshot.astro
│   │   ├── DeliveryInfoBar.astro   ← MOVED from inline
│   │   ├── MarketDashboard.astro
│   │   ├── CommodityCard.astro
│   │   ├── CostCalculator.tsx
│   │   ├── MultiStepLeadForm.tsx
│   │   ├── RecallsSection.astro
│   │   ├── RecallCard.astro
│   │   ├── MicroEmailCapture.astro
│   │   ├── StickyLeadCapture.tsx
│   │   ├── ExitIntentPopup.tsx
│   │   ├── ValuePropositions.astro ← EXTRACTED
│   │   ├── ProductCategories.astro ← EXTRACTED
│   │   ├── LocalMarketSection.astro ← EXTRACTED
│   │   ├── SocialProof.astro       ← EXTRACTED
│   │   ├── NearbyCities.astro      ← EXTRACTED
│   │   └── FooterCTA.astro
│   │
│   ├── forms/                      ← KEEP (refactor contents)
│   ├── market/                     ← ENHANCE
│   ├── ui/                         ← KEEP AS-IS
│   └── layout/                     ← KEEP AS-IS
│
├── lib/
│   ├── supabase.ts                 ← EXISTS
│   ├── market-data.ts              ← NEW
│   ├── recalls.ts                  ← NEW
│   └── lead-capture.ts             ← NEW
│
└── types/
    ├── market-data.ts              ← NEW
    ├── recalls.ts                  ← NEW
    └── leads.ts                    ← NEW (or enhance existing)

supabase/functions/
├── market-data/
│   └── index.ts                    ← NEW
├── recalls/
│   └── index.ts                    ← NEW
└── submit-lead/
    └── index.ts                    ← ENHANCE
```

---

## Data Integration Architecture

### API Data Sources

| Data Type | Source | Endpoint | Update Frequency | Cache TTL |
|-----------|--------|----------|------------------|-----------|
| Poultry Prices | USDA LMPR | Report 2462 | Daily ~2-4pm ET | 4 hours |
| Beef Prices | USDA LMPR | Report 2461 | Daily ~2-4pm ET | 4 hours |
| Diesel Prices | EIA | `/v2/petroleum/pri/gnd/` | Weekly (Monday) | 24 hours |
| Cooking Oil | USDA ERS | Oil Crops Yearbook | Monthly | 24 hours |
| Sugar | USDA ERS | Sugar Yearbook | Monthly | 24 hours |
| Food Recalls | FDA | `api.fda.gov/food/enforcement.json` | Continuous | 1 hour |
| Ocean Freight | Freightos FBX | FBX03 (Asia→USEC) | Daily | 4 hours |

### Data Flow

```
┌─────────────────┐     ┌─────────────────────────┐     ┌─────────────────┐
│  Government     │     │  Supabase Edge          │     │  Astro SSR      │
│  APIs           │ ──► │  Functions              │ ──► │  Pages          │
│  (USDA, EIA,    │     │  (Fetch, Cache, Store)  │     │  (Server-Side   │
│   FDA, etc.)    │     │                         │     │   Rendering)    │
└─────────────────┘     └─────────────────────────┘     └─────────────────┘
                                   │
                                   ▼
                        ┌─────────────────────────┐
                        │  PostgreSQL             │
                        │  (api_cache table)      │
                        │  (market_data_history)  │
                        └─────────────────────────┘
```

### Database Tables Needed

```sql
-- Cache table for API responses (may already exist)
CREATE TABLE IF NOT EXISTS api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  api_source TEXT NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historical market data for trends
CREATE TABLE IF NOT EXISTS market_data_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email subscriptions (micro captures)
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NOT NULL, -- 'market_dashboard', 'recalls', 'exit_intent'
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(email, source)
);
```

---

## Lead Capture Strategy

### 5 Capture Points at Different Friction Levels

| # | Capture Point | Location | Friction | What We Capture |
|---|--------------|----------|----------|-----------------|
| 1 | Market Alerts | Section 4 (Market Dashboard) | Very Low | Email only |
| 2 | Calculator Result | Section 5 (Calculator) | Low-Medium | Email + calculator inputs |
| 3 | Primary Form | Section 6 | Medium | Full qualification (3 steps) |
| 4 | Recall Alerts | Section 9 | Very Low | Email + category preference |
| 5 | Exit Intent | Popup | Very Low | Email only |

### Progressive Capture Logic

```
Casual Visitor ──► Email micro-capture ──► Nurture sequence ──► Return visit ──► Full form
                         │
Serious Buyer ──────────┴──► Calculator ──► Pre-qualified lead ──► Sales follow-up
```

---

## Implementation Phases

### Phase 1: Data Infrastructure (3-4 days)

**Objective:** Get live market data flowing

**Tasks:**
- [ ] Create/verify `api_cache` table in Supabase
- [ ] Create `market_data_history` table
- [ ] Create `email_subscriptions` table
- [ ] Build `market-data` Edge Function
  - [ ] USDA poultry fetcher
  - [ ] USDA beef fetcher
  - [ ] EIA diesel fetcher
  - [ ] Cache logic with TTL
- [ ] Build `recalls` Edge Function
  - [ ] FDA API integration
  - [ ] State filtering
  - [ ] Cache with 1-hour TTL
- [ ] Create TypeScript interfaces in `/types/`
- [ ] Create utility functions in `/lib/`

**Verification:**
- [ ] Edge functions return data via Supabase client
- [ ] Cache working (second request faster)
- [ ] Data persisting to history table

### Phase 2: Core New Components (5-7 days)

**Objective:** Build the new UI sections

**Tasks:**
- [ ] Create `/components/landing/` directory
- [ ] Build `RecallAlertBar.astro`
  - [ ] Red/amber styling based on severity
  - [ ] Sticky positioning
  - [ ] Mobile-responsive collapse
- [ ] Build `MarketSnapshot.astro`
  - [ ] 3 commodity price display
  - [ ] Trend arrows with color coding
  - [ ] Updated timestamp
- [ ] Build `HeroWithMarketSnapshot.astro`
  - [ ] Split layout (60/40)
  - [ ] Trust badges
  - [ ] CTAs
- [ ] Enhance `DeliveryInfoBar` component
  - [ ] Extract from inline to component
  - [ ] Add fuel surcharge calculation
- [ ] Build `MarketDashboard.astro`
  - [ ] 6 commodity/freight cards
  - [ ] Updated timestamp with sources
  - [ ] Inline email capture
- [ ] Build `CommodityCard.astro`
  - [ ] Price items with trends
  - [ ] Source attribution
- [ ] Build `MicroEmailCapture.astro`
  - [ ] Email-only form
  - [ ] Social proof text
  - [ ] Source tracking

**Verification:**
- [ ] All components render without errors
- [ ] Data flows from Edge Functions to components
- [ ] Mobile responsive at 320px, 768px, 1024px

### Phase 3: Interactive Components (5-7 days)

**Objective:** Build React islands for interactivity

**Tasks:**
- [ ] Build `CostCalculator.tsx`
  - [ ] Product type selection (radio)
  - [ ] Monthly spend slider
  - [ ] Pre-filled location
  - [ ] Calculate button
  - [ ] Results display
  - [ ] "Get Quote" CTA that triggers form
- [ ] Build `MultiStepLeadForm.tsx`
  - [ ] Step 1: Business type (icon buttons)
  - [ ] Step 2: Products + spend (checkboxes + radio)
  - [ ] Step 3: Contact info
  - [ ] Progress indicator
  - [ ] Calculator data integration (listen for custom event)
  - [ ] Form submission to Supabase
  - [ ] Success state
- [ ] Wire calculator → form data passing
  - [ ] Custom event dispatch from calculator
  - [ ] Event listener in form
  - [ ] Pre-fill and skip to Step 3

**Verification:**
- [ ] Calculator produces reasonable estimates
- [ ] Calculator "Get Quote" scrolls to and pre-fills form
- [ ] Form progression works (1 → 2 → 3)
- [ ] Form submits to database
- [ ] Success state displays

### Phase 4: Recalls & Supporting Sections (3-4 days)

**Objective:** Complete remaining sections

**Tasks:**
- [ ] Build `RecallsSection.astro`
  - [ ] Full recall cards
  - [ ] Filter by category (optional)
  - [ ] Link to FDA/USDA sources
  - [ ] Micro email capture
- [ ] Build `RecallCard.astro`
  - [ ] Severity badge (Class I/II)
  - [ ] Product, reason, distribution
  - [ ] Date and source link
- [ ] Extract `ValuePropositions.astro` from inline
- [ ] Extract `ProductCategories.astro` from inline
- [ ] Extract `LocalMarketSection.astro` from inline
- [ ] Extract `SocialProof.astro` from inline
- [ ] Extract `NearbyCities.astro` from inline
- [ ] Build `FooterCTA.astro`

**Verification:**
- [ ] Recalls section displays API data
- [ ] All extracted components work standalone
- [ ] Internal links work

### Phase 5: Persistent Elements (2-3 days)

**Objective:** Add sticky CTA and exit intent

**Tasks:**
- [ ] Build `StickyLeadCapture.tsx`
  - [ ] Desktop: Right sidebar with mini form
  - [ ] Mobile: Bottom bar with CTA buttons
  - [ ] Appears after scrolling past hero
  - [ ] Disappears at footer
- [ ] Build `ExitIntentPopup.tsx`
  - [ ] Mouse-leave detection (desktop)
  - [ ] 30-second minimum time on page
  - [ ] Once per session
  - [ ] Email-only capture
  - [ ] "Get market report" value prop
- [ ] Update `CityLayout.astro` for persistent elements

**Verification:**
- [ ] Sticky sidebar appears at correct scroll position
- [ ] Mobile bottom bar shows correctly
- [ ] Exit intent triggers appropriately
- [ ] Session storage prevents repeat popups

### Phase 6: Page Assembly & Polish (3-4 days)

**Objective:** Restructure city page and optimize

**Tasks:**
- [ ] Rewrite `[city].astro` with new section order
  - [ ] Import all new components
  - [ ] Fetch market data via Edge Function
  - [ ] Fetch recalls via Edge Function
  - [ ] Wire up all props
- [ ] Enable SSR for fresh data (`export const prerender = false`)
- [ ] Performance optimization
  - [ ] `client:visible` for below-fold components
  - [ ] `client:idle` for sticky/popup
  - [ ] Image optimization
- [ ] Mobile optimization pass
  - [ ] Touch targets 48px minimum
  - [ ] Form input 16px font (prevent iOS zoom)
  - [ ] Horizontal scroll for market cards
- [ ] Accessibility review
  - [ ] ARIA labels
  - [ ] Keyboard navigation
  - [ ] Color contrast

**Verification:**
- [ ] Page loads with all sections in correct order
- [ ] Market data displays fresh values
- [ ] All CTAs work
- [ ] Mobile responsive at all breakpoints
- [ ] Lighthouse Performance 90+
- [ ] Lighthouse Accessibility 90+

### Phase 7: Testing & Rollout (2-3 days)

**Objective:** Verify everything works across all cities

**Tasks:**
- [ ] Test on 5 different city pages (different tiers)
- [ ] Test form submission end-to-end
- [ ] Test email capture submissions
- [ ] Test calculator accuracy
- [ ] Verify SEO elements (titles, descriptions, schema)
- [ ] Deploy to staging
- [ ] Deploy to production

---

## Testing Checklist

### Data Integration
- [ ] Market data Edge Function returns cached data
- [ ] Recalls Edge Function returns filtered data
- [ ] Cache expiration works correctly
- [ ] Fallback behavior when APIs fail

### UI Components
- [ ] Recall bar displays correctly (with recalls)
- [ ] Recall bar shows "no recalls" state
- [ ] Market snapshot displays 3 commodities
- [ ] Market dashboard shows all 6 cards
- [ ] Commodity cards show prices and trends
- [ ] Fuel surcharge calculates correctly

### Interactive Features
- [ ] Calculator produces estimates
- [ ] Calculator data passes to form
- [ ] Form progresses through all steps
- [ ] Form validates required fields
- [ ] Form submits successfully
- [ ] Email captures work (all 5 points)
- [ ] Sticky sidebar appears/disappears correctly
- [ ] Exit intent triggers appropriately

### Mobile Experience
- [ ] All sections stack properly
- [ ] Touch targets are 48px minimum
- [ ] Forms don't zoom on iOS
- [ ] Sticky bottom bar works
- [ ] Horizontal scroll on market cards

### Performance
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] FID < 100ms
- [ ] Page load < 3s on 3G

---

## Success Metrics

| Metric | Current (Est.) | Target | Measurement |
|--------|---------------|--------|-------------|
| Form Conversion Rate | ~2-3% | 8-12% | Submissions / Unique Visitors |
| Email Capture Rate | 0% | 5-8% | Any email / Visitors |
| Calculator Engagement | N/A | 15-20% | Calculator interactions / Visitors |
| Return Visitor Rate | Unknown | 10-15% | Return / Total visits |
| Time on Page | Unknown | +40% | Before/after comparison |
| Scroll Depth to Form | ~30% | 70%+ | Analytics tracking |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API rate limits | Medium | High | Aggressive caching, fallback data |
| Slow Edge Function cold starts | Medium | Medium | Keep functions warm, regional deployment |
| Calculator estimates inaccurate | Low | Medium | Clear "estimate" disclaimer, validate logic |
| Form too long | Low | Medium | Multi-step reduces perceived length |
| Mobile performance issues | Medium | High | `client:visible` directives, image optimization |

---

## Appendix: Key TypeScript Interfaces

### Market Data Types
```typescript
interface MarketData {
  poultry: CommodityData;
  beef: CommodityData;
  cookingOil: CommodityData;
  sugar: CommodityData;
  diesel: DieselData;
  oceanFreight: FreightData;
  trucking: TruckingData;
  updatedAt: string;
}

interface CommodityData {
  items: CommodityItem[];
  source: string;
}

interface CommodityItem {
  name: string;
  price: number;
  unit: string;
  change: number; // percentage vs last week
}

interface DieselData {
  price: number;
  previousWeek: number;
  region: string;
  unit: string;
}
```

### Recall Types
```typescript
interface Recall {
  id: string;
  classification: 'Class I' | 'Class II' | 'Class III';
  product_description: string;
  reason_for_recall: string;
  distribution_pattern: string;
  recall_initiation_date: string;
  recalling_firm: string;
  url: string;
}
```

### Calculator Types
```typescript
interface CalculatorData {
  productType: 'disposables' | 'proteins' | 'both';
  monthlySpend: number;
  city: string;
  state: string;
}

interface CalculationResults {
  freightSavings: number;
  pricingSavings: number;
  totalAnnualSavings: number;
}
```

### Lead Form Types
```typescript
interface LeadFormData {
  // Step 1
  businessType: BusinessType;

  // Step 2
  productInterests: ProductCategory[];
  estimatedSpend: SpendRange;

  // Step 3
  businessName: string;
  contactName: string;
  email: string;
  phone?: string;

  // Meta
  city: string;
  state: string;
  source: 'city_landing' | 'calculator' | 'exit_intent';
  calculatorData?: CalculatorData;
}

type BusinessType = 'restaurant' | 'food_truck' | 'caterer' | 'institution' | 'grocery' | 'other';
type ProductCategory = 'disposables' | 'custom_print' | 'proteins' | 'eco_friendly';
type SpendRange = 'under_3k' | '3k_10k' | '10k_25k' | 'over_25k';
```

---

## Reference Documents

For detailed component code examples and specifications, see:

1. **[landing-page-restructure.md](./landing-page-restructure.md)** - Full page structure with visual mockups
2. **[claude-code-implementation-guide.md](./claude-code-implementation-guide.md)** - Complete component code examples

---

## Approval

This plan requires sign-off before implementation begins.

- [ ] Structure changes approved
- [ ] Component inventory approved
- [ ] Phase timeline acceptable
- [ ] Success metrics agreed

**Ready to proceed when approved.**
