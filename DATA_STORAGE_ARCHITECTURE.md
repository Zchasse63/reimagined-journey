# Data Storage & Caching Architecture

## Executive Summary

**Do you need Redis?** No. PostgreSQL-based caching is sufficient for your use case because:
- Government APIs update daily/weekly/monthly (not real-time)
- You're not handling thousands of requests per second
- PostgreSQL JSONB performs well for cache reads at your scale
- Historical data storage is more valuable than sub-millisecond cache access

**Should you store historical data?** Absolutely. Historical data enables:
- "Prices are X% lower than last month" messaging (powerful for conversion)
- Trend charts showing price movements over time
- Predictive content ("Based on drought conditions, expect beef prices to rise in Q2")
- SEO content that gets more valuable over time (historical price articles)

---

## Architecture Overview

### Two Distinct Patterns

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   PATTERN 1: SHORT-TERM CACHE                                           │
│   ┌─────────┐     ┌──────────────┐     ┌─────────────┐                 │
│   │ Client  │ ──▶ │ Edge Function│ ──▶ │ api_cache   │ TTL: 1-24 hours │
│   │ Request │     │    Proxy     │     │   Table     │                  │
│   └─────────┘     └──────────────┘     └─────────────┘                 │
│   Use for: Real-time lookups, tariff searches, FDA recalls             │
│                                                                          │
│   PATTERN 2: HISTORICAL STORAGE                                         │
│   ┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐ │
│   │ Scheduled   │ ──▶ │ commodity_prices │ ──▶ │ Analytics &         │ │
│   │ Cron Job    │     │ diesel_prices    │     │ Content Generation  │ │
│   │ (Daily)     │     │ drought_data     │     │                     │ │
│   └─────────────┘     └──────────────────┘     └─────────────────────┘ │
│   Use for: Price history, trend analysis, predictive content           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Why Not Redis?

| Factor | Redis | PostgreSQL | Winner for Your Use Case |
|--------|-------|------------|--------------------------|
| Read latency | <1ms | 2-10ms | Doesn't matter (APIs update daily) |
| Historical queries | Not designed for | Excellent | PostgreSQL |
| Time-series analysis | Basic | Native date functions | PostgreSQL |
| Operational complexity | Additional service | Already have it | PostgreSQL |
| Cost | $25-200/month (Upstash) | Included in Supabase | PostgreSQL |
| Data persistence | Requires config | Built-in | PostgreSQL |

**When you WOULD need Redis:**
- Real-time bidding systems (need <1ms)
- High-frequency trading data
- Session management at massive scale
- Pub/sub messaging

Your government APIs update at most daily. A 5ms PostgreSQL cache read vs. 0.5ms Redis read is invisible to users.

---

## Data Categories & Storage Strategy

### Category 1: Historical Storage (Store Forever)

Data that has long-term analytical value. Ingest daily/weekly via scheduled jobs.

| Data Source | Update Frequency | Storage Reason | Content Applications |
|-------------|------------------|----------------|---------------------|
| USDA beef/pork prices | Daily | Price trend charts, MoM comparisons | "Beef prices down 8% from last month" |
| EIA diesel prices | Weekly | Freight cost history, fuel surcharge trends | "Fuel surcharges at 6-month low" |
| BLS PPI (paper/plastic) | Monthly | Disposables cost tracking | "Paper goods inflation slowing" |
| US Drought Monitor | Weekly | Predictive correlation with proteins | "Drought conditions signal Q3 beef increases" |

### Category 2: Reference Data (Refresh Weekly)

Relatively static data that changes infrequently but needs to be queryable.

| Data Source | Update Frequency | Cache/Storage | Reason |
|-------------|------------------|---------------|--------|
| USITC tariff rates | On proclamation | 7-day cache | Rarely changes, simple lookups |
| HTS code descriptions | Rarely | 30-day cache | Reference only |
| Census import volumes | Monthly | Store historically | Trade trend analysis |

### Category 3: Real-Time Cache Only

Data that only matters in the moment—no historical value.

| Data Source | Cache TTL | Reason |
|-------------|-----------|--------|
| FDA recall alerts | 1 hour | Only current recalls matter |
| Freightos spot rates | 15 minutes | Quote accuracy |
| Live futures quotes | 5 minutes (if used) | Real-time pricing |

---

## Database Schema (Complete)

### Historical Price Tables

```sql
-- ============================================
-- PROTEIN PRICES (USDA LMPR)
-- ============================================
CREATE TABLE protein_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL,
  commodity TEXT NOT NULL, -- 'beef_choice', 'beef_select', 'pork_carcass'
  cut_type TEXT, -- 'boxed_cutout', 'carcass', 'primal'
  price_low DECIMAL(10,2),
  price_high DECIMAL(10,2),
  price_avg DECIMAL(10,2),
  volume_loads INTEGER, -- Trading volume
  unit TEXT DEFAULT 'cwt', -- hundredweight
  report_id TEXT, -- USDA report ID for reference
  raw_data JSONB, -- Full API response for debugging
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT uq_protein_daily UNIQUE(report_date, commodity, cut_type)
);

-- Index for common queries
CREATE INDEX idx_protein_commodity_date 
ON protein_prices(commodity, report_date DESC);

-- Index for trend queries
CREATE INDEX idx_protein_date_range 
ON protein_prices(report_date, commodity);

-- ============================================
-- DIESEL PRICES (EIA)
-- ============================================
CREATE TABLE diesel_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL, -- Week ending date
  region TEXT NOT NULL, -- 'national', 'padd1_east_coast', 'padd3_gulf'
  price_per_gallon DECIMAL(6,3) NOT NULL,
  change_from_prior_week DECIMAL(6,3),
  change_from_year_ago DECIMAL(6,3),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT uq_diesel_weekly UNIQUE(week_of, region)
);

CREATE INDEX idx_diesel_region_date 
ON diesel_prices(region, week_of DESC);

-- ============================================
-- PPI INDEX DATA (BLS)
-- ============================================
CREATE TABLE ppi_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_date DATE NOT NULL, -- First of month
  series_id TEXT NOT NULL, -- BLS series ID
  series_name TEXT NOT NULL, -- Human readable name
  index_value DECIMAL(10,2) NOT NULL,
  percent_change_monthly DECIMAL(6,2),
  percent_change_annual DECIMAL(6,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT uq_ppi_monthly UNIQUE(period_date, series_id)
);

-- Key series we track:
-- WPU091 = Paper products
-- WPU0712 = Plastic resins  
-- WPU1017 = Aluminum mill shapes
-- PCU311611311611 = Animal slaughtering

CREATE INDEX idx_ppi_series_date 
ON ppi_data(series_id, period_date DESC);

-- ============================================
-- DROUGHT DATA (PREDICTIVE)
-- ============================================
CREATE TABLE drought_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_of DATE NOT NULL,
  state_fips TEXT NOT NULL,
  state_name TEXT NOT NULL,
  d0_pct DECIMAL(5,2), -- Abnormally Dry %
  d1_pct DECIMAL(5,2), -- Moderate Drought %
  d2_pct DECIMAL(5,2), -- Severe Drought %
  d3_pct DECIMAL(5,2), -- Extreme Drought %
  d4_pct DECIMAL(5,2), -- Exceptional Drought %
  dsci DECIMAL(6,2), -- Drought Severity Coverage Index
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT uq_drought_weekly UNIQUE(week_of, state_fips)
);

-- Focus on cattle states for protein prediction
CREATE INDEX idx_drought_cattle_states 
ON drought_data(state_fips, week_of DESC)
WHERE state_fips IN ('48', '40', '20', '31', '08'); -- TX, OK, KS, NE, CO

-- ============================================
-- SHORT-TERM CACHE (unchanged)
-- ============================================
CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  api_source TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_cache_key ON api_cache(cache_key);
CREATE INDEX idx_cache_expires ON api_cache(expires_at);

-- Cleanup old cache entries (run hourly)
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

---

## Scheduled Data Ingestion

### Supabase pg_cron for Scheduled Jobs

Supabase supports `pg_cron` for scheduling database jobs. Enable it in Dashboard > Database > Extensions.

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule USDA data fetch (daily at 5 PM CT / 6 PM ET)
SELECT cron.schedule(
  'fetch-usda-prices',
  '0 18 * * 1-5', -- 6 PM ET, Mon-Fri
  $$SELECT net.http_post(
    'https://YOUR_PROJECT.supabase.co/functions/v1/ingest-usda',
    '{}',
    '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'
  )$$
);

-- Schedule EIA diesel fetch (weekly on Tuesday)
SELECT cron.schedule(
  'fetch-eia-diesel',
  '0 10 * * 2', -- 10 AM ET on Tuesday
  $$SELECT net.http_post(
    'https://YOUR_PROJECT.supabase.co/functions/v1/ingest-eia',
    '{}',
    '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'
  )$$
);

-- Schedule BLS PPI fetch (monthly on 16th)
SELECT cron.schedule(
  'fetch-bls-ppi',
  '0 10 16 * *', -- 10 AM ET on 16th of month
  $$SELECT net.http_post(
    'https://YOUR_PROJECT.supabase.co/functions/v1/ingest-bls',
    '{}',
    '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'
  )$$
);

-- Schedule drought data fetch (weekly on Friday)
SELECT cron.schedule(
  'fetch-drought-data',
  '0 10 * * 5', -- 10 AM ET on Friday
  $$SELECT net.http_post(
    'https://YOUR_PROJECT.supabase.co/functions/v1/ingest-drought',
    '{}',
    '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'
  )$$
);

-- Schedule cache cleanup (hourly)
SELECT cron.schedule(
  'cleanup-cache',
  '0 * * * *', -- Every hour
  $$SELECT cleanup_expired_cache()$$
);
```

---

## Edge Functions for Data Ingestion

### USDA Price Ingestion

```typescript
// supabase/functions/ingest-usda/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const USDA_BASE = "https://mpr.datamart.ams.usda.gov/services/v1.1/reports/";

// Reports to fetch daily
const REPORTS = [
  { id: "2461", commodity: "beef_choice", cutType: "boxed_cutout" },
  { id: "2461", commodity: "beef_select", cutType: "boxed_cutout" },
  { id: "2498", commodity: "pork_carcass", cutType: "carcass" },
];

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date().toISOString().split("T")[0].replace(/-/g, "/");
  const results = [];

  for (const report of REPORTS) {
    try {
      const response = await fetch(
        `${USDA_BASE}${report.id}?q=report_date=${today}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Filter for the specific commodity type
        const relevantResults = data.results.filter((r: any) => {
          if (report.commodity.includes("choice")) {
            return r.cutout_type === "Choice";
          } else if (report.commodity.includes("select")) {
            return r.cutout_type === "Select";
          }
          return true;
        });

        for (const result of relevantResults) {
          const { error } = await supabase.from("protein_prices").upsert({
            report_date: result.report_date.split("/").reverse().join("-"),
            commodity: report.commodity,
            cut_type: report.cutType,
            price_low: parseFloat(result.current_price_range_low || "0"),
            price_high: parseFloat(result.current_price_range_high || "0"),
            price_avg: parseFloat(result.current_wtd_avg || "0"),
            volume_loads: parseInt(result.current_loads || "0"),
            report_id: report.id,
            raw_data: result,
          }, {
            onConflict: "report_date,commodity,cut_type"
          });

          if (error) {
            console.error(`Error inserting ${report.commodity}:`, error);
          } else {
            results.push({ commodity: report.commodity, status: "success" });
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching report ${report.id}:`, err);
      results.push({ commodity: report.commodity, status: "error", error: String(err) });
    }
  }

  return new Response(JSON.stringify({ ingested: results }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### EIA Diesel Ingestion

```typescript
// supabase/functions/ingest-eia/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const EIA_API_KEY = Deno.env.get("EIA_API_KEY")!;

const REGIONS = [
  { id: "PET.EMD_EPD2D_PTE_NUS_DPG.W", name: "national" },
  { id: "PET.EMD_EPD2D_PTE_R10_DPG.W", name: "padd1_east_coast" },
  { id: "PET.EMD_EPD2D_PTE_R30_DPG.W", name: "padd3_gulf" },
];

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results = [];

  for (const region of REGIONS) {
    try {
      const response = await fetch(
        `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&facets[series][]=${region.id}&frequency=weekly&sort[0][column]=period&sort[0][direction]=desc&length=1`
      );
      const data = await response.json();

      if (data.response?.data?.[0]) {
        const record = data.response.data[0];
        
        const { error } = await supabase.from("diesel_prices").upsert({
          week_of: record.period,
          region: region.name,
          price_per_gallon: parseFloat(record.value),
        }, {
          onConflict: "week_of,region"
        });

        if (error) {
          console.error(`Error inserting ${region.name}:`, error);
        } else {
          results.push({ region: region.name, status: "success", price: record.value });
        }
      }
    } catch (err) {
      console.error(`Error fetching ${region.name}:`, err);
      results.push({ region: region.name, status: "error" });
    }
  }

  return new Response(JSON.stringify({ ingested: results }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

### Drought Data Ingestion

```typescript
// supabase/functions/ingest-drought/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";

// Focus on major cattle-producing states
const CATTLE_STATES = [
  { fips: "48", name: "Texas" },
  { fips: "40", name: "Oklahoma" },
  { fips: "20", name: "Kansas" },
  { fips: "31", name: "Nebraska" },
  { fips: "08", name: "Colorado" },
  { fips: "29", name: "Missouri" },
];

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results = [];

  // Get the most recent week's data
  const today = new Date();
  const endDate = today.toISOString().split("T")[0];
  const startDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
    .toISOString().split("T")[0];

  for (const state of CATTLE_STATES) {
    try {
      const response = await fetch(
        `https://usdmdataservices.unl.edu/api/StateStatistics/GetDroughtSeverityStatisticsByAreaPercent?aoi=${state.fips}&startdate=${startDate}&enddate=${endDate}&statisticsType=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        // Get the most recent week
        const latest = data[data.length - 1];
        
        const { error } = await supabase.from("drought_data").upsert({
          week_of: latest.MapDate || latest.ValidStart,
          state_fips: state.fips,
          state_name: state.name,
          d0_pct: parseFloat(latest.D0 || "0"),
          d1_pct: parseFloat(latest.D1 || "0"),
          d2_pct: parseFloat(latest.D2 || "0"),
          d3_pct: parseFloat(latest.D3 || "0"),
          d4_pct: parseFloat(latest.D4 || "0"),
          dsci: parseFloat(latest.DSCI || "0"),
        }, {
          onConflict: "week_of,state_fips"
        });

        if (error) {
          console.error(`Error inserting ${state.name}:`, error);
        } else {
          results.push({ 
            state: state.name, 
            status: "success",
            d2_plus: (parseFloat(latest.D2 || "0") + 
                      parseFloat(latest.D3 || "0") + 
                      parseFloat(latest.D4 || "0")).toFixed(1)
          });
        }
      }
    } catch (err) {
      console.error(`Error fetching ${state.name}:`, err);
      results.push({ state: state.name, status: "error" });
    }
  }

  return new Response(JSON.stringify({ ingested: results }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

---

## Querying Historical Data

### Price Comparison Queries

```sql
-- Get beef price change vs last week
SELECT 
  commodity,
  price_avg as current_price,
  LAG(price_avg, 1) OVER (PARTITION BY commodity ORDER BY report_date) as last_week,
  price_avg - LAG(price_avg, 1) OVER (PARTITION BY commodity ORDER BY report_date) as change,
  ROUND(
    ((price_avg - LAG(price_avg, 1) OVER (PARTITION BY commodity ORDER BY report_date)) 
    / LAG(price_avg, 1) OVER (PARTITION BY commodity ORDER BY report_date)) * 100, 
    1
  ) as pct_change
FROM protein_prices
WHERE commodity = 'beef_choice'
  AND report_date >= CURRENT_DATE - INTERVAL '14 days'
ORDER BY report_date DESC
LIMIT 1;

-- Get 30-day price trend
SELECT 
  report_date,
  price_avg,
  AVG(price_avg) OVER (ORDER BY report_date ROWS BETWEEN 4 PRECEDING AND CURRENT ROW) as moving_avg_5day
FROM protein_prices
WHERE commodity = 'beef_choice'
  AND report_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY report_date;

-- Compare current diesel to year ago
SELECT 
  d1.region,
  d1.price_per_gallon as current_price,
  d2.price_per_gallon as year_ago_price,
  d1.price_per_gallon - d2.price_per_gallon as change,
  ROUND(((d1.price_per_gallon - d2.price_per_gallon) / d2.price_per_gallon) * 100, 1) as pct_change
FROM diesel_prices d1
JOIN diesel_prices d2 
  ON d1.region = d2.region 
  AND d2.week_of = d1.week_of - INTERVAL '52 weeks'
WHERE d1.week_of = (SELECT MAX(week_of) FROM diesel_prices);
```

### Drought-Protein Correlation

```sql
-- Get current drought severity in cattle states
SELECT 
  state_name,
  d2_pct + d3_pct + d4_pct as severe_drought_pct,
  CASE 
    WHEN d2_pct + d3_pct + d4_pct > 50 THEN 'High protein price risk (3-6 mo)'
    WHEN d2_pct + d3_pct + d4_pct > 25 THEN 'Moderate protein price risk'
    ELSE 'Low drought impact expected'
  END as price_outlook
FROM drought_data
WHERE week_of = (SELECT MAX(week_of) FROM drought_data)
ORDER BY severe_drought_pct DESC;
```

---

## Edge Function for Real-Time + Historical

Combine cached real-time data with historical context:

```typescript
// supabase/functions/protein-pricing/index.ts
// Returns current price + historical context

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { commodity } = await req.json();

  // Get current + recent history
  const { data: priceHistory } = await supabase
    .from("protein_prices")
    .select("report_date, price_avg, price_low, price_high")
    .eq("commodity", commodity)
    .order("report_date", { ascending: false })
    .limit(30);

  if (!priceHistory || priceHistory.length === 0) {
    return new Response(JSON.stringify({ error: "No data found" }), {
      status: 404,
    });
  }

  const current = priceHistory[0];
  const lastWeek = priceHistory[5] || priceHistory[priceHistory.length - 1];
  const lastMonth = priceHistory[20] || priceHistory[priceHistory.length - 1];

  // Get drought context for beef
  let droughtContext = null;
  if (commodity.includes("beef")) {
    const { data: drought } = await supabase
      .from("drought_data")
      .select("state_name, d2_pct, d3_pct, d4_pct")
      .order("week_of", { ascending: false })
      .limit(6);

    if (drought) {
      const avgSevereDrought = drought.reduce((sum, d) => 
        sum + d.d2_pct + d.d3_pct + d.d4_pct, 0) / drought.length;
      
      droughtContext = {
        avgSevereDroughtPct: avgSevereDrought.toFixed(1),
        outlook: avgSevereDrought > 40 
          ? "Expect beef price increases in 3-6 months due to drought conditions"
          : avgSevereDrought > 20
          ? "Moderate drought conditions may affect prices"
          : "Low drought impact expected",
      };
    }
  }

  return new Response(JSON.stringify({
    current: {
      date: current.report_date,
      price: current.price_avg,
      range: { low: current.price_low, high: current.price_high },
    },
    comparison: {
      vsLastWeek: {
        price: lastWeek.price_avg,
        change: (current.price_avg - lastWeek.price_avg).toFixed(2),
        pctChange: (((current.price_avg - lastWeek.price_avg) / lastWeek.price_avg) * 100).toFixed(1),
      },
      vsLastMonth: {
        price: lastMonth.price_avg,
        change: (current.price_avg - lastMonth.price_avg).toFixed(2),
        pctChange: (((current.price_avg - lastMonth.price_avg) / lastMonth.price_avg) * 100).toFixed(1),
      },
    },
    history: priceHistory.reverse(), // Chronological for charting
    droughtContext,
  }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

---

## Initial Historical Data Backfill

When first deploying, backfill historical data:

```typescript
// supabase/functions/backfill-usda/index.ts
// One-time run to populate historical data

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Backfill last 365 days
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
  
  // USDA supports date range queries
  const formattedStart = startDate.toISOString().split("T")[0].replace(/-/g, "/");
  const formattedEnd = endDate.toISOString().split("T")[0].replace(/-/g, "/");

  const response = await fetch(
    `https://mpr.datamart.ams.usda.gov/services/v1.1/reports/2461?q=report_date=${formattedStart}:${formattedEnd}`
  );
  const data = await response.json();

  let inserted = 0;
  for (const result of data.results || []) {
    const { error } = await supabase.from("protein_prices").upsert({
      report_date: result.report_date.split("/").reverse().join("-"),
      commodity: result.cutout_type === "Choice" ? "beef_choice" : "beef_select",
      cut_type: "boxed_cutout",
      price_low: parseFloat(result.current_price_range_low || "0"),
      price_high: parseFloat(result.current_price_range_high || "0"),
      price_avg: parseFloat(result.current_wtd_avg || "0"),
      volume_loads: parseInt(result.current_loads || "0"),
      report_id: "2461",
      raw_data: result,
    }, {
      onConflict: "report_date,commodity,cut_type"
    });

    if (!error) inserted++;
  }

  return new Response(JSON.stringify({ 
    backfilled: inserted,
    dateRange: { start: formattedStart, end: formattedEnd }
  }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

---

## Content Use Cases for Historical Data

### 1. Dynamic Price Comparison Messaging

```typescript
// Component that shows price context
const PriceContext = ({ commodity }) => {
  const { data } = usePricing(commodity);
  
  if (!data) return null;

  const { vsLastMonth } = data.comparison;
  const changeNum = parseFloat(vsLastMonth.pctChange);
  
  return (
    <div className="bg-green-50 p-4 rounded-lg">
      {changeNum < 0 ? (
        <p className="text-green-700 font-semibold">
          🔻 {commodity} prices are down {Math.abs(changeNum)}% from last month — 
          good time to stock up!
        </p>
      ) : changeNum > 5 ? (
        <p className="text-amber-700 font-semibold">
          📈 {commodity} prices up {changeNum}% this month — 
          lock in pricing with a quote today
        </p>
      ) : (
        <p className="text-slate-600">
          {commodity} prices stable this month at ${data.current.price}/cwt
        </p>
      )}
    </div>
  );
};
```

### 2. Price Trend Charts

```typescript
// Historical price chart for landing pages
const PriceTrendChart = ({ commodity, days = 30 }) => {
  const { data } = usePricing(commodity);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">
        {commodity} Price Trend (Last {days} Days)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data?.history}>
          <XAxis dataKey="report_date" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="price_avg" 
            stroke="#22c55e" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-slate-500 mt-2">
        Source: USDA Market News • Updated daily
      </p>
    </div>
  );
};
```

### 3. Predictive Content (Drought → Protein)

```typescript
// Widget showing drought impact prediction
const DroughtOutlook = () => {
  const { data } = useDroughtData();
  
  if (!data?.droughtContext) return null;
  
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
      <h4 className="font-semibold text-amber-800">Market Outlook</h4>
      <p className="text-amber-700 mt-1">
        {data.droughtContext.outlook}
      </p>
      <p className="text-sm text-amber-600 mt-2">
        Cattle states at {data.droughtContext.avgSevereDroughtPct}% severe drought
      </p>
    </div>
  );
};
```

---

## Summary: What to Implement

### Phase 1: Core Storage (Week 1)
1. Create historical tables (protein_prices, diesel_prices, ppi_data, drought_data)
2. Keep existing api_cache table for short-term caching
3. Deploy ingestion Edge Functions

### Phase 2: Scheduled Jobs (Week 2)
1. Enable pg_cron extension
2. Schedule daily/weekly/monthly ingestion jobs
3. Run initial backfill for 1 year of data

### Phase 3: Content Integration (Week 3)
1. Build price comparison API endpoints
2. Add trend charts to landing pages
3. Implement dynamic messaging ("prices down X%")

### Phase 4: Predictive Features (Week 4+)
1. Drought-protein correlation tracking
2. Predictive content widgets
3. Email alerts for significant price movements

---

## Key Takeaways

1. **No Redis needed** — PostgreSQL is sufficient for your access patterns
2. **Store historical data** — It's more valuable than just caching
3. **Use pg_cron** — Built into Supabase for scheduled ingestion
4. **Backfill first** — Get 1 year of history before launch
5. **Build content features** — Historical data enables powerful conversion messaging
