# Value Source - Food Service Platform Build Plan

## Executive Summary

This document outlines the complete implementation plan for the Value Source food service distribution lead generation platform. The platform targets underserved food service segments (ghost kitchens, food trucks, caterers, ethnic grocers) across 156 cities in 15 states.

**Company Name**: Value Source
**Hub Location**: Atlanta, GA
**Total City Pages**: 156
**Target Launch**: Phase 1 complete in 2 weeks

---

## 1. Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEPENDENCY GRAPH                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WEEK 1: FOUNDATION                                                          │
│  ─────────────────                                                           │
│                                                                              │
│  [Turborepo Init] ──┬──► [Astro Setup] ──► [Tailwind Config]                │
│                     │                            │                           │
│                     │                            ▼                           │
│                     │                     [Design Tokens CSS]                │
│                     │                            │                           │
│                     └──► [Supabase Project] ─────┤                           │
│                               │                  │                           │
│                               ▼                  ▼                           │
│                      [DB Migrations]      [shadcn/ui Setup]                  │
│                               │                  │                           │
│                               ▼                  ▼                           │
│                      [RLS Policies]      [UI Components]                     │
│                               │                  │                           │
│                               └────────┬─────────┘                           │
│                                        │                                     │
│                                        ▼                                     │
│                               [Data Package Setup]                           │
│                                        │                                     │
│                                        ▼                                     │
│                              [City Data Utilities]                           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WEEK 2: LEAD CAPTURE + CORE PAGES                                          │
│  ─────────────────────────────────                                           │
│                                                                              │
│  [Lead Form Schema] ──► [Multi-Step Form] ──► [Form Submission]             │
│                                                      │                       │
│                                                      ▼                       │
│                                            [Notification Edge Fn]            │
│                                                      │                       │
│                                                      ▼                       │
│  [Base Layout] ──► [Header/Footer] ──► [Homepage] ──┘                       │
│                                             │                                │
│                                             ▼                                │
│                              [State Hub Template] ──► [City Template]        │
│                                                             │                │
│                                                             ▼                │
│                                              [GA + FL City Pages (22)]       │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WEEK 3-4: API LAYER + CALCULATORS                                          │
│  ─────────────────────────────────                                           │
│                                                                              │
│  [USDA Edge Fn] ──┐                                                          │
│  [EIA Edge Fn]  ──┼──► [API Cache Logic] ──► [Pricing Calculator]           │
│  [BLS Edge Fn]  ──┘                                │                         │
│                                                    ▼                         │
│  [USITC Edge Fn] ──────────────────────► [Tariff Lookup Tool]               │
│                                                                              │
│  [Historical Tables] ──► [pg_cron Jobs] ──► [Backfill Script]               │
│                                                    │                         │
│                                                    ▼                         │
│                                          [Price Trend Components]            │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WEEK 5-8: SCALE + SEO                                                       │
│  ─────────────────────                                                       │
│                                                                              │
│  [City Template] ──► [Batch Generation] ──► [134 Remaining Pages]           │
│                             │                                                │
│                             ▼                                                │
│                    [Internal Linking] ──► [Sitemap] ──► [Schema Markup]     │
│                                                               │              │
│                                                               ▼              │
│                                                    [Google Search Console]   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  WEEK 9-12: OPTIMIZATION                                                     │
│  ───────────────────────                                                     │
│                                                                              │
│  [Lighthouse Audit] ──► [Image Optimization] ──► [Core Web Vitals]          │
│                                                         │                    │
│  [A/B Testing] ──► [Conversion Tracking] ──────────────►│                    │
│                                                         │                    │
│  [Lead Scoring] ──► [Analytics Setup] ─────────────────►│                    │
│                                                         ▼                    │
│                                                    [LAUNCH]                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Critical Path Items

1. **Supabase Project Creation** - Blocks all database and Edge Function work
2. **Database Migrations** - Blocks lead form, API caching, and historical storage
3. **Design Tokens** - Blocks all UI component development
4. **City Data Package** - Blocks all city page generation
5. **Lead Form** - Core conversion mechanism, must work before launch

### Parallel Workstreams

These can be developed simultaneously:
- UI Components (shadcn/ui) + Database Migrations
- Edge Functions + Frontend Calculators
- City Pages (batches of 20-30) + SEO Infrastructure

---

## 2. Database Migrations Order

Execute migrations in this exact sequence:

### Migration 001: Leads Table
```sql
-- migrations/001_leads.sql
-- Priority: CRITICAL - Required for form submissions

CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Contact Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Business Information
  company_name TEXT NOT NULL,
  business_type TEXT NOT NULL,
  location_count INTEGER DEFAULT 1,

  -- Qualification
  service_territory TEXT,
  current_distributor TEXT,
  purchase_timeline TEXT,
  primary_interest TEXT[],

  -- Source Tracking
  source_city TEXT,
  source_state TEXT,
  source_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Processing
  lead_score INTEGER DEFAULT 0,
  lead_status TEXT DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,

  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_leads_status ON leads(lead_status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_source ON leads(source_city, source_state);
CREATE INDEX idx_leads_email ON leads(email);

-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public lead submission" ON leads
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Authenticated read leads" ON leads
  FOR SELECT TO authenticated USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Migration 002: API Cache Table
```sql
-- migrations/002_api_cache.sql
-- Priority: HIGH - Required for API proxy layer

CREATE TABLE api_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  api_source TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_cache_key ON api_cache(cache_key);
CREATE INDEX idx_cache_expires ON api_cache(expires_at);
CREATE INDEX idx_cache_source ON api_cache(api_source);

-- Cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM api_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

### Migration 003: Historical Price Tables
```sql
-- migrations/003_historical_prices.sql
-- Priority: MEDIUM - Required for calculators and content

-- Protein Prices (USDA LMPR)
CREATE TABLE protein_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  commodity TEXT NOT NULL,
  cut_type TEXT,
  price_low DECIMAL(10,2),
  price_high DECIMAL(10,2),
  price_avg DECIMAL(10,2),
  volume_loads INTEGER,
  unit TEXT DEFAULT 'cwt',
  report_id TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_protein_daily UNIQUE(report_date, commodity, cut_type)
);

CREATE INDEX idx_protein_commodity_date ON protein_prices(commodity, report_date DESC);
CREATE INDEX idx_protein_date_range ON protein_prices(report_date, commodity);

-- Diesel Prices (EIA)
CREATE TABLE diesel_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL,
  region TEXT NOT NULL,
  price_per_gallon DECIMAL(6,3) NOT NULL,
  change_from_prior_week DECIMAL(6,3),
  change_from_year_ago DECIMAL(6,3),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_diesel_weekly UNIQUE(week_of, region)
);

CREATE INDEX idx_diesel_region_date ON diesel_prices(region, week_of DESC);

-- PPI Data (BLS)
CREATE TABLE ppi_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_date DATE NOT NULL,
  series_id TEXT NOT NULL,
  series_name TEXT NOT NULL,
  index_value DECIMAL(10,2) NOT NULL,
  percent_change_monthly DECIMAL(6,2),
  percent_change_annual DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_ppi_monthly UNIQUE(period_date, series_id)
);

CREATE INDEX idx_ppi_series_date ON ppi_data(series_id, period_date DESC);

-- Drought Data (Predictive)
CREATE TABLE drought_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL,
  state_fips TEXT NOT NULL,
  state_name TEXT NOT NULL,
  d0_pct DECIMAL(5,2),
  d1_pct DECIMAL(5,2),
  d2_pct DECIMAL(5,2),
  d3_pct DECIMAL(5,2),
  d4_pct DECIMAL(5,2),
  dsci DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_drought_weekly UNIQUE(week_of, state_fips)
);

CREATE INDEX idx_drought_cattle_states ON drought_data(state_fips, week_of DESC)
WHERE state_fips IN ('48', '40', '20', '31', '08');
```

### Migration 004: API Usage Tracking
```sql
-- migrations/004_api_usage.sql
-- Priority: LOW - Nice to have for monitoring

CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_source TEXT NOT NULL,
  call_date DATE NOT NULL DEFAULT CURRENT_DATE,
  call_count INTEGER DEFAULT 1,

  UNIQUE(api_source, call_date)
);

CREATE INDEX idx_usage_date ON api_usage(call_date DESC);
```

### Migration 005: pg_cron Scheduled Jobs
```sql
-- migrations/005_scheduled_jobs.sql
-- Priority: MEDIUM - Required for automated data refresh
-- Note: Run this after pg_cron extension is enabled

-- Enable extension (requires Supabase dashboard or CLI)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- USDA daily at 5 PM CT (6 PM ET)
SELECT cron.schedule(
  'fetch-usda-prices',
  '0 18 * * 1-5',
  $$SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-usda',
    body := '{}'::jsonb
  )$$
);

-- EIA weekly Tuesday 10 AM
SELECT cron.schedule(
  'fetch-eia-diesel',
  '0 10 * * 2',
  $$SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-eia',
    body := '{}'::jsonb
  )$$
);

-- Drought data Friday 10 AM
SELECT cron.schedule(
  'fetch-drought-data',
  '0 10 * * 5',
  $$SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/ingest-drought',
    body := '{}'::jsonb
  )$$
);

-- Cache cleanup hourly
SELECT cron.schedule(
  'cleanup-cache',
  '0 * * * *',
  $$SELECT cleanup_expired_cache()$$
);
```

---

## 3. Edge Functions List

| Function Name | Purpose | Dependencies | Priority |
|---------------|---------|--------------|----------|
| `notify-lead` | Send Slack/email on new lead | leads table | CRITICAL |
| `usda-lmpr` | Proxy USDA beef/pork prices | api_cache table | HIGH |
| `eia-diesel` | Proxy EIA diesel prices | api_cache table | HIGH |
| `bls-ppi` | Proxy BLS producer price index | api_cache table | MEDIUM |
| `usitc-tariff` | Proxy tariff rate lookups | api_cache table | MEDIUM |
| `fda-recalls` | Proxy FDA recall alerts | api_cache table | LOW |
| `ingest-usda` | Scheduled USDA data ingestion | protein_prices table | MEDIUM |
| `ingest-eia` | Scheduled EIA data ingestion | diesel_prices table | MEDIUM |
| `ingest-drought` | Scheduled drought data ingestion | drought_data table | LOW |
| `backfill-usda` | One-time historical backfill | protein_prices table | MEDIUM |
| `protein-pricing` | Combined pricing + historical context | All price tables | MEDIUM |

### Edge Function Implementation Order

1. **notify-lead** - Required for lead capture to work
2. **usda-lmpr** - Enables pricing calculator
3. **eia-diesel** - Enables fuel surcharge calculator
4. **ingest-usda** - Sets up automated data refresh
5. **ingest-eia** - Sets up diesel price automation
6. **backfill-usda** - Populates historical data
7. **protein-pricing** - Unified pricing API with context
8. **bls-ppi**, **usitc-tariff**, **fda-recalls** - Lower priority tools

---

## 4. Component Inventory

### UI Components (shadcn/ui base)

| Component | Used In | Build Priority |
|-----------|---------|----------------|
| `Button` | All pages | CRITICAL |
| `Card` | Value props, product categories | CRITICAL |
| `Input` | Lead form | CRITICAL |
| `Select` | Lead form (business type) | CRITICAL |
| `Checkbox` | Lead form (interests) | CRITICAL |
| `Badge` | Trust badges, delivery info | HIGH |
| `Form` | Lead capture | CRITICAL |
| `Textarea` | Lead form (notes) | HIGH |
| `Label` | Form fields | CRITICAL |

### Custom Components

| Component | Description | Used In | Priority |
|-----------|-------------|---------|----------|
| `Header.astro` | Site navigation, logo, CTA | All pages | CRITICAL |
| `Footer.astro` | Links, contact, legal | All pages | CRITICAL |
| `Hero.astro` | City hero with H1, CTAs | City pages | CRITICAL |
| `DeliveryInfoBar.astro` | 4-column delivery details | City pages | CRITICAL |
| `ValueProps.astro` | 4 value proposition cards | City/home | HIGH |
| `ProductCategories.astro` | Product category cards | City/home | HIGH |
| `LocalMarket.astro` | Service area, anchors | City pages | HIGH |
| `Testimonial.astro` | Quote + attribution | City pages | MEDIUM |
| `NearbyCities.astro` | Internal link grid | City pages | HIGH |
| `LeadForm.tsx` | Multi-step React form | All pages | CRITICAL |
| `FormStep1.tsx` | Business type selector | Lead form | CRITICAL |
| `FormStep2.tsx` | Service info fields | Lead form | CRITICAL |
| `FormStep3.tsx` | Contact details | Lead form | CRITICAL |
| `ProgressIndicator.tsx` | Form step indicator | Lead form | HIGH |
| `TrustBadges.astro` | Stats badges | Hero section | HIGH |
| `PricingCalculator.tsx` | USDA price display | Calculator page | MEDIUM |
| `FreightCalculator.tsx` | Freightos widget wrapper | Calculator page | LOW |
| `TariffLookup.tsx` | HTS code search | Calculator page | LOW |
| `PriceTrendChart.tsx` | Historical price chart | City pages | LOW |

### Layout Components

| Component | Description | Priority |
|-----------|-------------|----------|
| `Layout.astro` | Base HTML, meta, scripts | CRITICAL |
| `CityLayout.astro` | City page wrapper | CRITICAL |
| `StateLayout.astro` | State hub wrapper | HIGH |

---

## 5. API Integration Sequence

### Phase 1: Foundation (No external APIs needed)
- Lead form submission to Supabase
- Notification webhook (Slack/email)

### Phase 2: Priority APIs (Week 3)

| Order | API | Endpoint | Auth | Cache TTL |
|-------|-----|----------|------|-----------|
| 1 | USDA LMPR | `mpr.datamart.ams.usda.gov/services/v1.1/reports/` | None | 4 hours |
| 2 | EIA Diesel | `api.eia.gov/v2/petroleum/pri/gnd/` | Free API key | 24 hours |

### Phase 2: Secondary APIs (Week 4)

| Order | API | Endpoint | Auth | Cache TTL |
|-------|-----|----------|------|-----------|
| 3 | BLS PPI | `api.bls.gov/publicAPI/v2/timeseries/data/` | Free API key | 24 hours |
| 4 | USITC Tariff | `hts.usitc.gov/api/` | None | 7 days |
| 5 | FDA Recalls | `api.fda.gov/food/enforcement.json` | Optional key | 1 hour |

### Phase 3: Widgets (Week 5+)

| Order | Widget | Integration Method |
|-------|--------|-------------------|
| 6 | Freightos | Embed script |
| 7 | US Drought Monitor | REST API |

### Fallback Behavior

| API | Fallback Strategy |
|-----|-------------------|
| USDA | Show "Market data updating" + last cached value |
| EIA | Show national average + "as of [date]" |
| BLS | Show "Trend data loading" placeholder |
| Tariff | Show "Enter HTS code for lookup" prompt |
| FDA | Hide section if unavailable |

### Testing Strategy

1. **Unit Tests**: Mock API responses for each Edge Function
2. **Integration Tests**: Verify cache behavior (cache hit, cache miss, expiry)
3. **Rate Limit Tests**: Ensure we stay within daily limits
4. **Fallback Tests**: Verify graceful degradation when APIs fail

---

## 6. Content Generation Plan

### Template System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT GENERATION FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  city_data.json ──► [state]/[city].astro ──► Generated HTML     │
│       │                     │                                    │
│       │                     ├── Hero (city, state, tier)        │
│       │                     ├── DeliveryBar (tier-specific)     │
│       │                     ├── ValueProps (tier-specific)      │
│       │                     ├── Products (eco_emphasis)         │
│       │                     ├── LocalMarket (anchors)           │
│       │                     ├── Testimonial (state/region)      │
│       │                     ├── NearbyCities (from data)        │
│       │                     └── LeadForm (city prefilled)       │
│       │                                                          │
│       └── Astro getStaticPaths() generates all 156 routes       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Page Generation Schedule

| Phase | States | Cities | Cumulative |
|-------|--------|--------|------------|
| Week 2 | GA, FL | 22 | 22 |
| Week 5 | AL, TN | 20 | 42 |
| Week 6 | SC, NC | 22 | 64 |
| Week 7 | MS, KY, VA | 32 | 96 |
| Week 8 | OH, IN, IL, MO, TX, OK | 60 | 156 |

### Content Uniqueness Strategy

Each city page gets unique content from:

1. **City-specific data** (from city_data.json):
   - City name, state
   - Delivery tier, method, frequency, lead time
   - Distance from Atlanta
   - Interstate corridors
   - Military bases, universities, hospitals, tourism

2. **Tier-specific messaging**:
   - Hero subhead varies by Hub/Route/Carrier
   - Value prop text varies by delivery type
   - Minimum order varies ($3K vs $5K)

3. **State-specific content**:
   - Compliance information
   - Eco-emphasis level
   - Regional testimonials

4. **Computed content**:
   - Nearby cities (internal links)
   - Service radius description
   - Local market statistics

### SEO Requirements Per Page

| Element | Formula | Example |
|---------|---------|---------|
| H1 | `Food Service Distribution in {city}, {state}` | Food Service Distribution in Tampa, Florida |
| Title | `Food Service Distribution in {city}, {state_abbr} \| Value Source` | Food Service Distribution in Tampa, FL \| Value Source |
| Description | 150-160 chars with city name, delivery method, key benefit | Weekly route truck delivery to Tampa from our Atlanta distribution center... |
| Schema | `Service` type with `areaServed` | Structured data for search |
| Canonical | `https://valuesource.com/{state}/{city}/` | Prevent duplicates |

### Internal Linking Structure

```
Homepage
├── /georgia/ (State Hub)
│   ├── /georgia/atlanta/ (Hub City)
│   ├── /georgia/savannah/ ──► Links to: macon, augusta, jacksonville, charleston
│   ├── /georgia/macon/ ──► Links to: atlanta, savannah, columbus, albany
│   └── ... (7 more)
├── /florida/ (State Hub)
│   ├── /florida/tampa/ ──► Links to: sarasota, orlando, lakeland, st-pete
│   ├── /florida/miami/ ──► Links to: fort-lauderdale, west-palm, key-west
│   └── ... (11 more)
└── ... (13 more states)
```

---

## 7. Testing Checkpoints

### End of Week 1 Verification

- [ ] `pnpm install` runs without errors
- [ ] `pnpm dev` starts Astro dev server on localhost:4321
- [ ] Tailwind classes compile correctly
- [ ] Design tokens (colors, fonts, spacing) render correctly
- [ ] shadcn/ui Button and Card components work
- [ ] Supabase project accessible
- [ ] Database migrations executed successfully
- [ ] `leads` table exists with correct schema
- [ ] TypeScript compiles without errors

### End of Week 2 Verification

- [ ] Homepage renders with all sections
- [ ] Lead form displays 3-step flow
- [ ] Form validation works (email format, required fields)
- [ ] Form submission inserts to Supabase
- [ ] Slack notification fires on submission
- [ ] Email notification sends
- [ ] At least 1 city page (Atlanta) renders correctly
- [ ] City page shows correct delivery tier info
- [ ] Mobile responsive at all breakpoints
- [ ] All navigation links work

### End of Week 4 Verification

- [ ] USDA Edge Function returns cached data
- [ ] EIA Edge Function returns diesel prices
- [ ] BLS Edge Function returns PPI data
- [ ] Pricing calculator displays real data
- [ ] Historical data backfill completed (1 year)
- [ ] pg_cron jobs scheduled in Supabase
- [ ] Price comparison queries work
- [ ] Cache expiration works correctly

### End of Week 8 Verification

- [ ] All 156 city pages generate
- [ ] Each page has unique H1, title, description
- [ ] Internal links work (nearby cities, state hub)
- [ ] Schema markup validates (Google Rich Results Test)
- [ ] Sitemap includes all pages (156+ URLs)
- [ ] Build time under 2 minutes
- [ ] No duplicate content warnings
- [ ] All images have alt text

### Pre-Launch Verification

- [ ] Lighthouse score 90+ on Performance
- [ ] Lighthouse score 90+ on Accessibility
- [ ] Lighthouse score 90+ on SEO
- [ ] LCP < 2.5s on all pages
- [ ] CLS < 0.1 on all pages
- [ ] Forms convert (test submissions work)
- [ ] Analytics tracking fires
- [ ] Error monitoring captures issues
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] 404 page exists
- [ ] Legal pages exist (Privacy, Terms)

---

## 8. Environment Variables

### Required for Development

```bash
# Supabase
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# External APIs
EIA_API_KEY=your_key  # Required for diesel prices
BLS_API_KEY=your_key  # Required for PPI data
```

### Required for Production

```bash
# All development variables PLUS:

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SENDGRID_API_KEY=SG...  # Or RESEND_API_KEY

# Optional
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Analytics (optional)
PLAUSIBLE_DOMAIN=valuesource.com
```

### API Key Registration Links

| API | Registration URL | Notes |
|-----|-----------------|-------|
| EIA | https://www.eia.gov/opendata/register.php | Instant |
| BLS | https://data.bls.gov/registrationEngine/ | Instant |
| Census | https://api.census.gov/data/key_signup.html | Instant |
| FDA | https://open.fda.gov/apis/authentication/ | Optional but recommended |

---

## 9. Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API rate limits exceeded | Medium | Medium | Implement caching, monitor usage |
| Build time grows too long | Low | Medium | Use ISR for low-traffic pages |
| Supabase Edge Function cold starts | Medium | Low | Keep functions warm, use regional deployment |
| Form spam | High | Medium | Honeypot fields, rate limiting |

### Content Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Duplicate content penalties | Medium | High | Ensure 40%+ unique content per page |
| Thin content warnings | Low | Medium | Minimum 500 words per city page |
| Stale pricing data | Medium | Medium | Show "as of" dates, automated refresh |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low form conversion | Medium | High | A/B test CTAs, reduce form fields |
| Slow lead response | Medium | High | Automated notifications, SLA tracking |

---

## 10. Success Criteria

### Phase 1 Success (Week 2)

- [ ] Lead form submitting to database
- [ ] Real-time notifications working
- [ ] 22 city pages live (GA + FL)
- [ ] Mobile-responsive design

### Phase 2 Success (Week 4)

- [ ] Pricing calculator showing real USDA data
- [ ] Fuel surcharge calculator working
- [ ] Historical data populated

### Phase 3 Success (Week 8)

- [ ] All 156 city pages indexed
- [ ] Sitemap submitted to Google
- [ ] Internal linking complete

### Phase 4 Success (Week 12)

- [ ] Core Web Vitals all "Good"
- [ ] 5%+ landing page conversion rate
- [ ] <60 second lead response time

---

## Next Steps

1. **Review this plan** and identify any questions or concerns
2. **Set up external accounts** (Supabase, Netlify, API keys)
3. **Begin Phase 1 implementation** starting with project initialization

Ready to proceed when you approve this plan.
