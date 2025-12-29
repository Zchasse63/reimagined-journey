# API & Data Sources Reference

## Overview

This document consolidates all API integrations, data sources, and caching strategies for the food service distribution platform. The platform uses a tiered approach: free government APIs for 80% of data needs, low-cost commercial APIs for real-time capabilities, and strategic premium subscriptions where ROI justifies cost.

---

## Architecture

### API Proxy Pattern

All external APIs are accessed through Supabase Edge Functions to:
- Manage rate limits
- Cache responses
- Abstract API complexity from frontend
- Enable stale-while-revalidate patterns

```
┌─────────────┐     ┌─────────────────┐     ┌────────────────┐
│   Client    │ ──▶ │  Supabase Edge  │ ──▶ │  External API  │
│ Calculator  │     │    Function     │     │   (USDA, etc)  │
└─────────────┘     └────────┬────────┘     └────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   PostgreSQL   │
                    │     Cache      │
                    └────────────────┘
```

### Cache Schema

```sql
CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  api_source TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  INDEX idx_cache_key ON api_cache(cache_key),
  INDEX idx_expires ON api_cache(expires_at)
);

-- Cleanup function for expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM api_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## Free Government APIs (Tier 1 - Priority)

### USDA Livestock Mandatory Price Reporting (LMPR)

**Purpose**: Daily beef and pork wholesale pricing for protein calculators.

**Base URL**: `https://mpr.datamart.ams.usda.gov/services/v1.1/reports/`

**Authentication**: None required

**Rate Limits**: Soft limits only (no hard cap); monitor for abuse

**Key Reports**:

| Report ID | Description | Update Frequency |
|-----------|-------------|------------------|
| `2461` | Boxed Beef Daily | Daily ~2-4 PM CT |
| `2498` | Daily Hog/Pork Summary | Daily |
| `2463` | Weekly Cattle | Weekly |
| `2459` | USDA 5-Area Steer | Daily |

**Example Request**:
```bash
curl "https://mpr.datamart.ams.usda.gov/services/v1.1/reports/2461?q=report_date=01/25/2024"
```

**Response Fields** (Boxed Beef):
```json
{
  "results": [
    {
      "report_date": "01/25/2024",
      "current_price_range_low": "295.00",
      "current_price_range_high": "305.00",
      "current_wtd_avg": "300.50",
      "previous_wtd_avg": "298.25",
      "cutout_type": "Choice"
    }
  ]
}
```

**Cache TTL**: 4 hours

**Edge Function**: `/functions/usda-lmpr`

---

### USDA MyMarketNews (MARS API)

**Purpose**: Additional agricultural market data including limited seafood.

**Base URL**: `https://marsapi.ams.usda.gov/services/v1.2/`

**Authentication**: Free registration required - email mymarketnews@ams.usda.gov

**Rate Limits**: 
- Unregistered: 5,000 rows/request
- Registered: 100,000 rows/request

**Endpoints**:
| Endpoint | Description |
|----------|-------------|
| `/reports` | List available reports |
| `/reports/{slug_id}` | Get report data |

**Cache TTL**: 4 hours

---

### EIA Petroleum Data (Diesel Prices)

**Purpose**: Weekly diesel prices for fuel surcharge calculations.

**Base URL**: `https://api.eia.gov/v2/petroleum/pri/gnd/`

**Authentication**: Free API key required - register at eia.gov/opendata/register.php

**Rate Limits**: ~500 queries/day recommended

**Key Series**:
| Series | Description | Region |
|--------|-------------|--------|
| `PET.EMD_EPD2D_PTE_NUS_DPG.W` | US average diesel | National |
| `PET.EMD_EPD2D_PTE_R10_DPG.W` | PADD 1 (East Coast) | East Coast |
| `PET.EMD_EPD2D_PTE_R30_DPG.W` | PADD 3 (Gulf) | Gulf Coast |

**Example Request**:
```bash
curl "https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=YOUR_KEY&facets[product][]=EPD2D&frequency=weekly"
```

**Update Frequency**: Weekly (Monday release)

**Cache TTL**: 24 hours

**Edge Function**: `/functions/eia-diesel`

---

### BLS Producer Price Index

**Purpose**: Monthly inflation tracking for disposables (paper, plastic, aluminum).

**Base URL**: `https://api.bls.gov/publicAPI/v2/timeseries/data/`

**Authentication**: Free registration required at api.data.gov

**Rate Limits**:
- Version 2 API: 50 series, 20 years, 500 queries/day

**Key Series**:
| Series ID | Description |
|-----------|-------------|
| `WPU091` | Paper products |
| `WPU0911` | Pulp and allied products |
| `WPU0712` | Plastic resins and materials |
| `WPU1017` | Aluminum mill shapes |
| `PCU322211322211` | Corrugated box manufacturing |

**Example Request** (POST):
```json
{
  "seriesid": ["WPU091", "WPU0712"],
  "startyear": "2023",
  "endyear": "2024",
  "registrationkey": "YOUR_KEY"
}
```

**Update Frequency**: Monthly (~2 week lag)

**Cache TTL**: 24 hours

**Edge Function**: `/functions/bls-ppi`

---

### USITC HTS Tariff API

**Purpose**: Tariff rate lookups for import cost calculators.

**Base URL**: `https://hts.usitc.gov/api/`

**Authentication**: None required

**Rate Limits**: None published

**Endpoints**:
| Endpoint | Description |
|----------|-------------|
| `/search?query={term}` | Search HTS codes |
| `/export?format=csv&from=0100&to=0200` | Bulk export by chapter |

**Key HTS Chapters for Food Service**:
| Chapter | Description |
|---------|-------------|
| 02-23 | Food products (meat, fish, dairy, vegetables) |
| 4818 | Paper napkins and tissues |
| 4819 | Cartons, boxes, bags of paper |
| 7607 | Aluminum foil |
| 3924 | Plastic tableware and kitchenware |

**Data**: Public domain, no restrictions

**Cache TTL**: 7 days (changes infrequently)

**Edge Function**: `/functions/usitc-tariff`

---

### Census Bureau International Trade

**Purpose**: Import/export volumes by HTS code and country.

**Base URL**: `https://api.census.gov/data/timeseries/intltrade/imports/hs`

**Authentication**: Free API key required at api.data.gov

**Rate Limits**: 100,000 rows/request for registered users

**Parameters**:
| Parameter | Description |
|-----------|-------------|
| `HS` | HTS code (6-10 digits) |
| `CTY_CODE` | Country code |
| `time` | Year-month (YYYY-MM) |
| `GEN_VAL_MO` | General import value |

**Example Request**:
```bash
curl "https://api.census.gov/data/timeseries/intltrade/imports/hs?get=GEN_VAL_MO,CTY_NAME&HS=0304&time=2024-01&key=YOUR_KEY"
```

**Update Frequency**: Monthly (~6 business days after month end)

**Cache TTL**: 24 hours

---

### US Drought Monitor

**Purpose**: Predictive indicator for protein prices (3-6 month lead).

**Base URL**: `https://usdmdataservices.unl.edu/api/`

**Authentication**: None required

**Rate Limits**: None published

**Endpoints**:
| Endpoint | Description |
|----------|-------------|
| `/StateStatistics/GetDroughtSeverityStatisticsByArea` | State-level data |
| `/CountyStatistics/GetDroughtSeverityStatisticsByArea` | County-level data |

**Drought Severity Levels**:
| Code | Level | Description |
|------|-------|-------------|
| D0 | Abnormally Dry | Short-term dryness |
| D1 | Moderate Drought | Some damage to crops |
| D2 | Severe Drought | Crop/pasture losses likely |
| D3 | Extreme Drought | Major crop/pasture losses |
| D4 | Exceptional Drought | Exceptional widespread losses |

**Update Frequency**: Weekly (Thursday)

**Cache TTL**: 24 hours

**Use Case**: Correlate D2+ drought in cattle states (TX, OK, KS) with beef price increases 3-6 months out.

---

### NOAA Fisheries (FOSS)

**Purpose**: Seafood trade data and commercial landings.

**URL**: `https://fisheries.noaa.gov/foss/`

**Authentication**: None required

**Data Available**:
- Commercial landings by state
- US trade in fishery products (imports/exports)
- Species: Shrimp, salmon, crab, lobster, tilapia, cod, pollock, tuna
- Import sources: Vietnam, Thailand, Ecuador, Canada, China, India

**Access Method**: Query tool with CSV export (no RESTful API)

**Update Frequency**: ~43 days after month close

**Cache**: Download and store monthly snapshots

---

### FDA Food Recall API (openFDA)

**Purpose**: Automated recall monitoring for customer alerts.

**Base URL**: `https://api.fda.gov/food/enforcement.json`

**Authentication**: 
- No key: 40 requests/minute, 1,000/day
- Free key: 240 requests/minute, 120,000/day

**Example Request**:
```bash
curl "https://api.fda.gov/food/enforcement.json?search=product_description:beef+AND+classification:Class+I&limit=10"
```

**Classification Levels**:
| Class | Severity |
|-------|----------|
| Class I | Dangerous or defective - serious health consequences |
| Class II | May cause temporary health problems |
| Class III | Not likely to cause health problems |

**Cache TTL**: 1 hour (time-sensitive)

**Edge Function**: `/functions/fda-recalls`

---

## Free Embeddable Widgets (Tier 1)

### Freightos Shipping Calculator

**Purpose**: Ocean freight rate estimates for import cost education.

**Widget Embed Code**:
```html
<estimator></estimator>
<script src="https://www.freightos.com/tools/embed.js"></script>
```

**Public API**: `https://ship.freightos.com/api/shippingCalculator`
- No API key required
- 100 calls/hour per IP

**Freightos Baltic Index (FBX)**:
| Route | Code | Description |
|-------|------|-------------|
| FBX03 | China/East Asia → US East Coast | Most relevant for Savannah imports |

**Update Frequency**: Daily at 14:00 UTC

**Cost**: Free tier requires Freightos credit; Premium starts at $119/month

---

### Trading Economics Widgets

**Purpose**: Commodity price displays for sugar, cooking oils.

**Widget Types**:
- Price ticker
- Historical chart
- Comparison tables

**Commodities Available**:
- Sugar (raw, refined)
- Soybean oil
- Palm oil
- Canola oil

**Cost**: Personal plans ~$49/month; includes both API and widgets

---

## Commercial APIs (Tier 2 - As Needed)

### Metals-API (Aluminum Foil Pricing)

**Purpose**: LME aluminum prices for foil container cost estimates.

**Base URL**: `https://metals-api.com/api/`

**Pricing**:
| Plan | Cost | Calls | Features |
|------|------|-------|----------|
| Starter | $4.99/month | 200 | Current prices |
| Standard | $79.99/month | 2,000 | Historical data |
| Professional | $149.99/month | 10,000 | All metals |

**Endpoints**:
| Endpoint | Description |
|----------|-------------|
| `/latest` | Current prices |
| `/historical` | Historical prices |
| `/timeseries` | Time range data |

**Cache TTL**: 1 hour

---

### Barchart OnDemand

**Purpose**: Unified commodity data including USDA grain prices.

**Base URL**: `https://ondemand.websol.barchart.com/`

**Key Endpoints**:
| Endpoint | Description |
|----------|-------------|
| `/getUSDAGrainPrices.json` | Includes crude soybean oil |
| `/getQuote.json` | Futures quotes |
| `/getCashData.json` | Cash grain bids by zip |

**Pricing**: Usage-based; contact for rates

**Documentation**: Well-documented REST/SOAP APIs with PHP, Python, Ruby samples

---

### Urner Barry (via Barchart)

**Purpose**: Industry-standard protein and seafood benchmark prices.

**Data Coverage**:
- Domestic shrimp (all grades)
- Imported shrimp (Mexico, Latin America, Asia)
- Salmon, lobster, crab, scallops
- Beef and pork benchmarks

**Update Frequency**: Tuesday and Thursday

**Access Method**: Available through Barchart Solutions API integration

**Cost**: $3,000-15,000/year depending on markets

**Recommendation**: Consider only if publishing daily price content or using for contract negotiations.

---

## Premium Data Sources (Tier 3 - Enterprise Scale)

### DAT Freight & Analytics

**Purpose**: Lane-by-lane trucking rates for accurate freight cost calculations.

**Coverage**: 149 regional markets, 68,000+ lanes

**Features**:
- Spot and contract rates
- Ratecast forecasting (95% accuracy on 52-week)
- Capacity indicators

**Cost**: $5,000-50,000+/year (enterprise)

**Alternative**: Use ATRI benchmarks ($2.26/mile average) for educational estimates.

---

### Fastmarkets (formerly RISI)

**Purpose**: Paper and pulp pricing for disposables cost analysis.

**Coverage**: 3,500+ grades including:
- NBSK pulp
- Containerboard
- Kraftliner

**Cost**: $10,000-50,000+/year

**Alternative**: Use BLS PPI series WPU091 for monthly trend tracking (free).

---

## Database Schema for API Data

### Commodity Prices Table

```sql
CREATE TABLE commodity_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity_type TEXT NOT NULL, -- 'beef', 'pork', 'diesel', 'aluminum'
  source TEXT NOT NULL, -- 'usda_lmpr', 'eia', 'metals_api'
  price_date DATE NOT NULL,
  price_low DECIMAL(10,2),
  price_high DECIMAL(10,2),
  price_avg DECIMAL(10,2),
  unit TEXT NOT NULL, -- 'cwt', 'gallon', 'lb'
  grade TEXT, -- 'Choice', 'Select', etc.
  region TEXT, -- 'National', 'PADD1', etc.
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(commodity_type, source, price_date, grade, region)
);

CREATE INDEX idx_commodity_lookup 
ON commodity_prices(commodity_type, price_date DESC);
```

### Tariff Lookup Table

```sql
CREATE TABLE tariff_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hts_code TEXT NOT NULL,
  description TEXT NOT NULL,
  general_rate TEXT,
  special_rate TEXT,
  column_2_rate TEXT,
  unit_of_quantity TEXT,
  section_301_rate TEXT, -- Additional China tariffs
  ad_cvd_orders TEXT, -- Anti-dumping/countervailing
  effective_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(hts_code, effective_date)
);

CREATE INDEX idx_hts_search ON tariff_rates(hts_code);
```

---

## Edge Function Examples

### USDA LMPR Proxy

```typescript
// supabase/functions/usda-lmpr/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const USDA_BASE = "https://mpr.datamart.ams.usda.gov/services/v1.1/reports/";
const CACHE_TTL_HOURS = 4;

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  
  const { reportId, date } = await req.json();
  const cacheKey = `usda_lmpr_${reportId}_${date}`;
  
  // Check cache
  const { data: cached } = await supabase
    .from("api_cache")
    .select("data, expires_at")
    .eq("cache_key", cacheKey)
    .single();
  
  if (cached && new Date(cached.expires_at) > new Date()) {
    return new Response(JSON.stringify(cached.data), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  // Fetch fresh data
  const response = await fetch(
    `${USDA_BASE}${reportId}?q=report_date=${date}`
  );
  const data = await response.json();
  
  // Update cache
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000);
  await supabase
    .from("api_cache")
    .upsert({
      cache_key: cacheKey,
      api_source: "usda_lmpr",
      data,
      expires_at: expiresAt.toISOString()
    });
  
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
});
```

### EIA Diesel Proxy

```typescript
// supabase/functions/eia-diesel/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const EIA_BASE = "https://api.eia.gov/v2/petroleum/pri/gnd/data/";
const EIA_KEY = Deno.env.get("EIA_API_KEY");
const CACHE_TTL_HOURS = 24;

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  
  const { region = "national" } = await req.json();
  const cacheKey = `eia_diesel_${region}`;
  
  // Check cache
  const { data: cached } = await supabase
    .from("api_cache")
    .select("data, expires_at")
    .eq("cache_key", cacheKey)
    .single();
  
  if (cached && new Date(cached.expires_at) > new Date()) {
    return new Response(JSON.stringify(cached.data), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  // Fetch fresh data
  const params = new URLSearchParams({
    api_key: EIA_KEY!,
    "facets[product][]": "EPD2D",
    frequency: "weekly",
    sort: "-period",
    length: "12" // Last 12 weeks
  });
  
  const response = await fetch(`${EIA_BASE}?${params}`);
  const data = await response.json();
  
  // Update cache
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000);
  await supabase
    .from("api_cache")
    .upsert({
      cache_key: cacheKey,
      api_source: "eia",
      data,
      expires_at: expiresAt.toISOString()
    });
  
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
});
```

---

## Implementation Priority

### Phase 1 (Month 1-2) - Free APIs

| API | Purpose | Effort |
|-----|---------|--------|
| USDA LMPR | Protein pricing calculator | 8 hours |
| EIA Diesel | Fuel surcharge calculator | 4 hours |
| USITC HTS | Tariff lookup tool | 8 hours |
| BLS PPI | Disposables cost trends | 4 hours |
| FDA Recalls | Customer alerts | 4 hours |

**Total**: ~28 hours development

### Phase 2 (Month 3-4) - Widgets & Enrichment

| Source | Purpose | Effort |
|--------|---------|--------|
| Freightos widgets | Ocean freight estimator | 2 hours |
| US Drought Monitor | Predictive content | 4 hours |
| NOAA FOSS | Seafood market data | 4 hours |
| Census Trade | Import volume context | 4 hours |

**Total**: ~14 hours development

### Phase 3 (Month 5+) - Commercial APIs

Evaluate based on content engagement and lead quality:
- If price content drives engagement → Consider Metals-API ($80/month)
- If customers request real-time data → Consider Barchart
- If contract negotiation use cases emerge → Consider Urner Barry

---

## Monitoring & Alerts

### API Health Checks

```sql
-- Check for stale cache entries by source
SELECT 
  api_source,
  COUNT(*) as total_entries,
  COUNT(*) FILTER (WHERE expires_at < NOW()) as expired,
  MAX(created_at) as last_update
FROM api_cache
GROUP BY api_source;
```

### Rate Limit Monitoring

Track API calls per day:

```sql
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_source TEXT NOT NULL,
  call_date DATE NOT NULL DEFAULT CURRENT_DATE,
  call_count INTEGER DEFAULT 1,
  
  UNIQUE(api_source, call_date)
);

-- Increment on each call
INSERT INTO api_usage (api_source, call_date, call_count)
VALUES ('usda_lmpr', CURRENT_DATE, 1)
ON CONFLICT (api_source, call_date)
DO UPDATE SET call_count = api_usage.call_count + 1;
```

### Alerting Thresholds

| API | Daily Limit | Alert Threshold |
|-----|-------------|-----------------|
| EIA | 500 | 400 (80%) |
| BLS | 500 | 400 (80%) |
| FDA (no key) | 1,000 | 800 (80%) |
| Freightos | 2,400 | 2,000 (83%) |

---

## Environment Variables

```bash
# Required API Keys
EIA_API_KEY=your_eia_key
BLS_API_KEY=your_bls_key
CENSUS_API_KEY=your_census_key
FDA_API_KEY=your_fda_key  # Optional but recommended

# Supabase
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional Commercial APIs
METALS_API_KEY=your_metals_key
BARCHART_API_KEY=your_barchart_key
```

---

## Data Refresh Schedule

| Source | Frequency | Best Time to Fetch |
|--------|-----------|-------------------|
| USDA LMPR | Daily | 5:00 PM CT (after market close) |
| EIA Diesel | Weekly | Tuesday AM (after Monday release) |
| BLS PPI | Monthly | 15th of month |
| Drought Monitor | Weekly | Friday AM (after Thursday release) |
| FDA Recalls | Hourly | Continuous |
| Tariff Rates | Weekly | Sunday night |
