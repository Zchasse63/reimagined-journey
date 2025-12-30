# Claude Code Implementation Guide: Food Service Landing Page Restructure

## PROJECT CONTEXT

You are helping build a B2B food service distribution lead generation platform. The site serves as an educational resource that helps food service operators (restaurants, caterers, food trucks, institutions) find supply solutions while generating leads for a food service brokerage operating out of Atlanta, GA.

### Technology Stack
- **Framework:** Astro with islands architecture (hybrid SSR/SSG)
- **Hosting:** Netlify
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (Radix primitives)
- **Monorepo:** Turborepo

### Business Context
- Atlanta-based food service brokerage selling disposables and proteins
- Serves 156 cities across 15 states (primarily Southeast US)
- Delivery tiers: Hub (Atlanta), Route ($3K/$5K minimums), Common Carrier
- Differentiator: Custom print capabilities for disposables
- Target customers: Ghost kitchens, food trucks, caterers, ethnic grocers, independent restaurants

---

## THE PROBLEM WE'RE SOLVING

The current landing page template has critical issues:

1. **Lead capture form buried in Section 7** - Too late in the page, after value props and product categories
2. **Zero market intelligence data visible** - We have API integrations for commodity prices, freight rates, and recall alerts but they're not being displayed
3. **No reason for visitors to return** - Page is a static brochure, not a resource
4. **Missing SEO opportunities** - No fresh content signals for Google's "Query Deserves Freshness" algorithm

### Current Page Structure (REPLACE THIS)
```
1. Hero Section
2. Delivery Info Bar
3. Value Proposition Section
4. Product Categories
5. Local Market Section
6. Social Proof
7. Nearby Cities Served
8. Lead Capture Form  ← Problem: Too late
9. Footer CTA
```

---

## NEW PAGE STRUCTURE (IMPLEMENT THIS)

```
1. RECALL ALERT BAR (Sticky)           ← NEW: Safety-first, builds trust
2. HERO + MARKET SNAPSHOT              ← ENHANCED: Live commodity prices in hero
3. DELIVERY INFO BAR                   ← ENHANCED: Add fuel surcharge from EIA data
4. MARKET INTELLIGENCE DASHBOARD       ← NEW: Commodity prices, freight rates, trends
5. COST CALCULATOR                     ← NEW: Interactive tool, pre-qualifies leads
6. PRIMARY LEAD CAPTURE FORM           ← MOVED UP: Multi-step form after value
7. VALUE PROPOSITIONS                  ← MOVED DOWN: Now supports the ask
8. PRODUCT CATEGORIES                  ← Unchanged
9. ACTIVE RECALLS SECTION              ← NEW: Full recall details + micro-capture
10. LOCAL MARKET SECTION               ← Unchanged
11. SOCIAL PROOF                       ← Unchanged
12. NEARBY CITIES                      ← Unchanged
13. FOOTER CTA                         ← Unchanged

PERSISTENT ELEMENTS:
- Sticky sidebar (desktop) / Sticky bottom bar (mobile)
- Exit intent popup
```

---

## FILE STRUCTURE

Create/modify the following files:

```
src/
├── components/
│   ├── landing/
│   │   ├── RecallAlertBar.astro          # NEW
│   │   ├── HeroWithMarketSnapshot.astro   # NEW (replaces Hero.astro)
│   │   ├── MarketSnapshot.astro           # NEW
│   │   ├── DeliveryInfoBar.astro          # MODIFY (add fuel surcharge)
│   │   ├── MarketDashboard.astro          # NEW
│   │   ├── CommodityCard.astro            # NEW
│   │   ├── CostCalculator.tsx             # NEW (React island)
│   │   ├── MultiStepLeadForm.tsx          # NEW (React island)
│   │   ├── RecallsSection.astro           # NEW
│   │   ├── RecallCard.astro               # NEW
│   │   ├── StickyLeadCapture.tsx          # NEW (React island)
│   │   ├── ExitIntentPopup.tsx            # NEW (React island)
│   │   └── MicroEmailCapture.astro        # NEW
│   │
│   └── ui/                                # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── slider.tsx
│       ├── checkbox.tsx
│       ├── radio-group.tsx
│       ├── progress.tsx
│       ├── badge.tsx
│       └── dialog.tsx
│
├── layouts/
│   └── CityLandingLayout.astro            # MODIFY
│
├── pages/
│   └── food-service-distribution/
│       └── [state]/
│           └── [city].astro               # MODIFY
│
├── lib/
│   ├── supabase.ts                        # Supabase client
│   ├── market-data.ts                     # Market data fetching utilities
│   ├── recalls.ts                         # Recall data utilities
│   └── lead-capture.ts                    # Lead submission utilities
│
└── types/
    ├── market-data.ts                     # TypeScript interfaces
    ├── recalls.ts
    ├── leads.ts
    └── city-data.ts

supabase/
└── functions/
    ├── market-data/
    │   └── index.ts                       # NEW: Aggregates all market APIs
    ├── recalls/
    │   └── index.ts                       # NEW: Fetches FDA/USDA recalls
    ├── submit-lead/
    │   └── index.ts                       # NEW: Handles lead submissions
    └── shared/
        ├── cache.ts                       # Cache utilities
        └── api-clients.ts                 # API client configurations
```

---

## SECTION 1: RECALL ALERT BAR

### Purpose
Display active food recalls prominently at top of page. Builds trust, establishes authority, and provides immediate value.

### Data Source
- **API:** openFDA Food Enforcement API
- **Endpoint:** `https://api.fda.gov/food/enforcement.json`
- **Filter:** Class I and Class II recalls, last 90 days, product types relevant to food service

### Component: `RecallAlertBar.astro`

```astro
---
// src/components/landing/RecallAlertBar.astro
interface Props {
  recalls: Recall[];
  state: string;
}

interface Recall {
  id: string;
  classification: 'Class I' | 'Class II' | 'Class III';
  product_description: string;
  reason_for_recall: string;
  distribution_pattern: string;
  recall_initiation_date: string;
  url: string;
}

const { recalls, state } = Astro.props;

// Filter to recalls affecting this state
const relevantRecalls = recalls.filter(r => 
  r.distribution_pattern.toLowerCase().includes(state.toLowerCase()) ||
  r.distribution_pattern.toLowerCase().includes('nationwide')
);

const classOneRecalls = relevantRecalls.filter(r => r.classification === 'Class I');
const hasUrgentRecalls = classOneRecalls.length > 0;
---

{relevantRecalls.length > 0 && (
  <div 
    class={`sticky top-0 z-50 px-4 py-2 text-sm font-medium ${
      hasUrgentRecalls 
        ? 'bg-red-600 text-white' 
        : 'bg-amber-500 text-amber-950'
    }`}
  >
    <div class="container mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-lg">⚠️</span>
        <span>
          {relevantRecalls.length} Active Recall{relevantRecalls.length !== 1 ? 's' : ''} 
          Affecting {state} Food Service
          {hasUrgentRecalls && <span class="ml-2 font-bold">(Includes Class I)</span>}
        </span>
      </div>
      <a 
        href="#recalls-section" 
        class={`underline hover:no-underline ${
          hasUrgentRecalls ? 'text-white' : 'text-amber-950'
        }`}
      >
        View Details ↓
      </a>
    </div>
  </div>
)}

{relevantRecalls.length === 0 && (
  <div class="bg-green-600 text-white px-4 py-2 text-sm">
    <div class="container mx-auto flex items-center gap-2">
      <span>✓</span>
      <span>No active recalls affecting {state} food service — Updated today</span>
    </div>
  </div>
)}
```

### Supabase Edge Function: `recalls/index.ts`

```typescript
// supabase/functions/recalls/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CACHE_TTL_HOURS = 1; // Check frequently for safety-critical data

interface RecallRequest {
  state?: string;
  categories?: string[];
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { state, categories } = await req.json() as RecallRequest;
  const cacheKey = `recalls-${state || 'all'}`;

  // Check cache
  const { data: cached } = await supabase
    .from('api_cache')
    .select('data, expires_at')
    .eq('cache_key', cacheKey)
    .single();

  if (cached && new Date(cached.expires_at) > new Date()) {
    return new Response(JSON.stringify(cached.data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Fetch fresh data from FDA
  const fdaUrl = new URL('https://api.fda.gov/food/enforcement.json');
  fdaUrl.searchParams.set('limit', '100');
  fdaUrl.searchParams.set('search', [
    'status:"Ongoing"',
    'classification:("Class I" OR "Class II")',
    `recall_initiation_date:[${getDateNDaysAgo(90)} TO ${getToday()}]`
  ].join(' AND '));

  const response = await fetch(fdaUrl.toString());
  const data = await response.json();

  const recalls = data.results?.map((r: any) => ({
    id: r.recall_number,
    classification: r.classification,
    product_description: r.product_description,
    reason_for_recall: r.reason_for_recall,
    distribution_pattern: r.distribution_pattern,
    recall_initiation_date: r.recall_initiation_date,
    recalling_firm: r.recalling_firm,
    url: `https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts`
  })) || [];

  // Cache the results
  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000);
  await supabase.from('api_cache').upsert({
    cache_key: cacheKey,
    api_source: 'fda_enforcement',
    data: { recalls, fetchedAt: new Date().toISOString() },
    expires_at: expiresAt.toISOString()
  });

  return new Response(JSON.stringify({ recalls }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

function getDateNDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

function getToday(): string {
  return new Date().toISOString().split('T')[0].replace(/-/g, '');
}
```

---

## SECTION 2: HERO + MARKET SNAPSHOT

### Purpose
Split hero with city/service info on left, live market data card on right. Demonstrates immediate value.

### Component: `HeroWithMarketSnapshot.astro`

```astro
---
// src/components/landing/HeroWithMarketSnapshot.astro
import MarketSnapshot from './MarketSnapshot.astro';
import { Button } from '@/components/ui/button';

interface Props {
  city: string;
  state: string;
  stateAbbr: string;
  subheadline: string;
  trustBadges: {
    yearsInBusiness: number;
    customersServed: number;
    onTimeRate: string;
  };
  marketData: MarketData;
}

interface MarketData {
  chicken: PricePoint;
  cookingOil: PricePoint;
  diesel: PricePoint;
  updatedAt: string;
}

interface PricePoint {
  current: number;
  previousWeek: number;
  unit: string;
}

const { city, state, stateAbbr, subheadline, trustBadges, marketData } = Astro.props;

function calculateChange(current: number, previous: number): { percent: number; direction: 'up' | 'down' | 'flat' } {
  const change = ((current - previous) / previous) * 100;
  return {
    percent: Math.abs(change),
    direction: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'flat'
  };
}
---

<section class="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 lg:py-24">
  <div class="container mx-auto px-4">
    <div class="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
      
      <!-- Left: Hero Content (3 cols) -->
      <div class="lg:col-span-3 space-y-6">
        <h1 class="text-4xl lg:text-5xl font-bold leading-tight">
          Food Service Distribution in {city}, {state}
        </h1>
        
        <p class="text-xl text-slate-300 max-w-2xl">
          {subheadline}
        </p>
        
        <div class="flex flex-wrap gap-4">
          <Button size="lg" class="bg-orange-500 hover:bg-orange-600 text-white">
            Get Custom Pricing
          </Button>
          <Button size="lg" variant="outline" class="border-white text-white hover:bg-white/10">
            See Full Market Data ↓
          </Button>
        </div>
        
        <div class="flex flex-wrap gap-6 pt-4 text-sm text-slate-300">
          <div class="flex items-center gap-2">
            <span class="text-green-400">✓</span>
            <span>{trustBadges.yearsInBusiness}+ Years Serving {stateAbbr}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-green-400">✓</span>
            <span>{trustBadges.customersServed}+ {city} Customers</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-green-400">✓</span>
            <span>{trustBadges.onTimeRate} On-Time Delivery</span>
          </div>
        </div>
      </div>
      
      <!-- Right: Market Snapshot (2 cols) -->
      <div class="lg:col-span-2">
        <MarketSnapshot data={marketData} />
      </div>
      
    </div>
  </div>
</section>
```

### Component: `MarketSnapshot.astro`

```astro
---
// src/components/landing/MarketSnapshot.astro
interface Props {
  data: {
    chicken: PricePoint;
    cookingOil: PricePoint;
    diesel: PricePoint;
    updatedAt: string;
  };
}

interface PricePoint {
  current: number;
  previousWeek: number;
  unit: string;
}

const { data } = Astro.props;

function formatChange(current: number, previous: number) {
  const percentChange = ((current - previous) / previous) * 100;
  const direction = percentChange > 0.5 ? 'up' : percentChange < -0.5 ? 'down' : 'flat';
  return { 
    percent: Math.abs(percentChange).toFixed(1), 
    direction,
    // For buyers: price drops are good (green), price increases are bad (red)
    color: direction === 'down' ? 'text-green-400' : direction === 'up' ? 'text-red-400' : 'text-slate-400'
  };
}

const chicken = formatChange(data.chicken.current, data.chicken.previousWeek);
const oil = formatChange(data.cookingOil.current, data.cookingOil.previousWeek);
const diesel = formatChange(data.diesel.current, data.diesel.previousWeek);

const updatedTime = new Date(data.updatedAt).toLocaleTimeString('en-US', { 
  hour: 'numeric', 
  minute: '2-digit',
  hour12: true 
});
---

<div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
  <h3 class="text-lg font-semibold mb-4 text-white">Today's Market</h3>
  
  <div class="space-y-4">
    <!-- Chicken -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🍗</span>
        <span class="text-slate-300">Chicken</span>
      </div>
      <div class="text-right">
        <div class="font-semibold">${data.chicken.current.toFixed(2)}/{data.chicken.unit}</div>
        <div class={`text-sm ${chicken.color}`}>
          {chicken.direction === 'up' ? '↑' : chicken.direction === 'down' ? '↓' : '─'} 
          {chicken.percent}%
        </div>
      </div>
    </div>
    
    <!-- Cooking Oil -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🛢️</span>
        <span class="text-slate-300">Soybean Oil</span>
      </div>
      <div class="text-right">
        <div class="font-semibold">${data.cookingOil.current.toFixed(2)}/{data.cookingOil.unit}</div>
        <div class={`text-sm ${oil.color}`}>
          {oil.direction === 'up' ? '↑' : oil.direction === 'down' ? '↓' : '─'} 
          {oil.percent}%
        </div>
      </div>
    </div>
    
    <!-- Diesel -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="text-2xl">⛽</span>
        <span class="text-slate-300">Diesel (SE)</span>
      </div>
      <div class="text-right">
        <div class="font-semibold">${data.diesel.current.toFixed(2)}/{data.diesel.unit}</div>
        <div class={`text-sm ${diesel.color}`}>
          {diesel.direction === 'up' ? '↑' : diesel.direction === 'down' ? '↓' : '─'} 
          {diesel.percent}%
        </div>
      </div>
    </div>
  </div>
  
  <div class="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400">
    Updated: {updatedTime}
  </div>
</div>
```

---

## SECTION 3: DELIVERY INFO BAR (Enhanced)

### Enhancement
Add fuel surcharge calculation based on EIA diesel data.

```astro
---
// src/components/landing/DeliveryInfoBar.astro
interface Props {
  deliveryMethod: string;
  deliveryIcon: 'warehouse' | 'truck' | 'freight';
  deliveryFrequency: string;
  leadTime: string;
  minimumOrder: string;
  dieselPrice: number;
  baseDieselPrice?: number; // Default: $2.50
}

const { 
  deliveryMethod, 
  deliveryIcon, 
  deliveryFrequency, 
  leadTime, 
  minimumOrder,
  dieselPrice,
  baseDieselPrice = 2.50
} = Astro.props;

// Calculate fuel surcharge
const fuelSurcharge = Math.max(0, ((dieselPrice - baseDieselPrice) / baseDieselPrice) * 100);

const icons = {
  warehouse: '🏭',
  truck: '🚚',
  freight: '📦'
};
---

<div class="bg-slate-100 border-y border-slate-200">
  <div class="container mx-auto px-4 py-4">
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
      
      <div class="flex items-center justify-center gap-2">
        <span class="text-2xl">{icons[deliveryIcon]}</span>
        <span class="font-medium">{deliveryMethod}</span>
      </div>
      
      <div class="flex items-center justify-center gap-2">
        <span class="text-2xl">📅</span>
        <span>{deliveryFrequency}</span>
      </div>
      
      <div class="flex items-center justify-center gap-2">
        <span class="text-2xl">📋</span>
        <span>{leadTime}</span>
      </div>
      
      <div class="flex items-center justify-center gap-2">
        <span class="text-2xl">💰</span>
        <span>{minimumOrder} Min</span>
      </div>
      
      <div class="flex items-center justify-center gap-2">
        <span class="text-2xl">⛽</span>
        <span class="text-sm">
          Fuel: {fuelSurcharge.toFixed(1)}%
          <span class="text-slate-500 text-xs ml-1">(${dieselPrice.toFixed(2)}/gal)</span>
        </span>
      </div>
      
    </div>
  </div>
</div>
```

---

## SECTION 4: MARKET INTELLIGENCE DASHBOARD

### Purpose
Full market data display with commodity prices, freight indicators, and trends. This is the traffic driver - content that brings people back.

### Component: `MarketDashboard.astro`

```astro
---
// src/components/landing/MarketDashboard.astro
import CommodityCard from './CommodityCard.astro';
import MicroEmailCapture from './MicroEmailCapture.astro';

interface Props {
  city: string;
  marketData: {
    poultry: CommodityData;
    beef: CommodityData;
    cookingOil: CommodityData;
    sugar: CommodityData;
    oceanFreight: FreightData;
    trucking: TruckingData;
    updatedAt: string;
  };
  distanceFromAtlanta: number; // miles
}

interface CommodityData {
  items: Array<{
    name: string;
    price: number;
    unit: string;
    change: number;
  }>;
  source: string;
}

interface FreightData {
  routes: Array<{
    origin: string;
    destination: string;
    rate: number;
    change: number;
    unit: string;
  }>;
  source: string;
}

interface TruckingData {
  costPerMile: number;
  dieselPrice: number;
  source: string;
}

const { city, marketData, distanceFromAtlanta } = Astro.props;

const estimatedTruckingCost = (distanceFromAtlanta * marketData.trucking.costPerMile).toFixed(0);
---

<section class="py-16 bg-white" id="market-data">
  <div class="container mx-auto px-4">
    
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold mb-4">
        Today's Market Intelligence for {city} Food Service
      </h2>
      <p class="text-slate-600 max-w-2xl mx-auto">
        Live commodity prices and freight rates updated daily. Bookmark this page to stay informed.
      </p>
    </div>
    
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      
      <!-- Poultry Card -->
      <CommodityCard
        title="Poultry"
        icon="🍗"
        items={marketData.poultry.items}
        source={marketData.poultry.source}
      />
      
      <!-- Beef Card -->
      <CommodityCard
        title="Beef"
        icon="🥩"
        items={marketData.beef.items}
        source={marketData.beef.source}
      />
      
      <!-- Cooking Oil Card -->
      <CommodityCard
        title="Cooking Oil"
        icon="🛢️"
        items={marketData.cookingOil.items}
        source={marketData.cookingOil.source}
      />
      
      <!-- Sugar Card -->
      <CommodityCard
        title="Sugar"
        icon="🍬"
        items={marketData.sugar.items}
        source={marketData.sugar.source}
      />
      
      <!-- Ocean Freight Card -->
      <div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">🚢</span>
          <h3 class="font-semibold text-lg">Ocean Freight</h3>
        </div>
        <div class="space-y-3">
          {marketData.oceanFreight.routes.map((route) => (
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600">{route.origin} → {route.destination}</span>
              <div class="text-right">
                <div class="font-medium">${route.rate.toLocaleString()}/{route.unit}</div>
                <div class={`text-xs ${route.change < 0 ? 'text-green-600' : route.change > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                  {route.change > 0 ? '↑' : route.change < 0 ? '↓' : '─'} {Math.abs(route.change)}% vs last month
                </div>
              </div>
            </div>
          ))}
        </div>
        <div class="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
          Source: {marketData.oceanFreight.source}
        </div>
      </div>
      
      <!-- Trucking Card -->
      <div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">🚛</span>
          <h3 class="font-semibold text-lg">Trucking</h3>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-slate-600">Atlanta → {city}</span>
            <div class="text-right">
              <div class="font-medium">~${estimatedTruckingCost}</div>
              <div class="text-xs text-slate-500">{distanceFromAtlanta} miles</div>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-slate-600">Cost per mile</span>
            <div class="font-medium">${marketData.trucking.costPerMile.toFixed(2)}</div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-slate-600">Current diesel</span>
            <div class="font-medium">${marketData.trucking.dieselPrice.toFixed(2)}/gal</div>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-200">
          <a href="#calculator" class="text-orange-600 hover:text-orange-700 text-sm font-medium">
            Calculate your route →
          </a>
        </div>
      </div>
      
    </div>
    
    <!-- Last Updated + Email Capture -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6 border-t border-slate-200">
      <div class="text-sm text-slate-500">
        Last updated: {new Date(marketData.updatedAt).toLocaleString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}
        <br />
        Sources: USDA Market News, EIA, Freightos Baltic Index
      </div>
      
      <MicroEmailCapture 
        headline="Get weekly market updates"
        subtext="Join 2,400+ food service operators who start their week informed."
        buttonText="Subscribe"
        source="market_dashboard"
      />
    </div>
    
  </div>
</section>
```

### Component: `CommodityCard.astro`

```astro
---
// src/components/landing/CommodityCard.astro
interface Props {
  title: string;
  icon: string;
  items: Array<{
    name: string;
    price: number;
    unit: string;
    change: number; // percentage vs last week
  }>;
  source: string;
}

const { title, icon, items, source } = Astro.props;
---

<div class="bg-slate-50 rounded-xl p-6 border border-slate-200">
  <div class="flex items-center gap-2 mb-4">
    <span class="text-2xl">{icon}</span>
    <h3 class="font-semibold text-lg">{title}</h3>
  </div>
  
  <div class="space-y-3">
    {items.map((item) => (
      <div class="flex justify-between items-center">
        <span class="text-sm text-slate-600">{item.name}</span>
        <div class="text-right">
          <div class="font-medium">${item.price.toFixed(2)}/{item.unit}</div>
          <div class={`text-xs ${item.change < 0 ? 'text-green-600' : item.change > 0 ? 'text-red-600' : 'text-slate-500'}`}>
            {item.change > 0 ? '↑' : item.change < 0 ? '↓' : '─'} {Math.abs(item.change).toFixed(1)}% vs LW
          </div>
        </div>
      </div>
    ))}
  </div>
  
  <div class="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
    Source: {source}
  </div>
</div>
```

### Component: `MicroEmailCapture.astro`

```astro
---
// src/components/landing/MicroEmailCapture.astro
interface Props {
  headline: string;
  subtext: string;
  buttonText: string;
  source: string;
}

const { headline, subtext, buttonText, source } = Astro.props;
---

<div class="bg-slate-100 rounded-lg p-4 max-w-md">
  <div class="flex items-center gap-2 mb-2">
    <span>📧</span>
    <span class="font-medium text-sm">{headline}</span>
  </div>
  
  <form 
    action="/api/subscribe" 
    method="POST" 
    class="flex gap-2"
    data-source={source}
  >
    <input 
      type="email" 
      name="email" 
      placeholder="your@email.com"
      required
      class="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
    />
    <button 
      type="submit"
      class="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors"
    >
      {buttonText}
    </button>
  </form>
  
  <p class="text-xs text-slate-500 mt-2">{subtext}</p>
</div>
```

---

## SECTION 5: COST CALCULATOR

### Purpose
Interactive tool that pre-qualifies leads through their inputs while demonstrating value. Uses React for client-side interactivity.

### Component: `CostCalculator.tsx`

```tsx
// src/components/landing/CostCalculator.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  city: string;
  state: string;
  distanceFromAtlanta: number;
  dieselPrice: number;
  onRequestQuote?: (data: CalculatorData) => void;
}

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

export default function CostCalculator({ 
  city, 
  state, 
  distanceFromAtlanta,
  dieselPrice,
  onRequestQuote 
}: Props) {
  const [productType, setProductType] = useState<'disposables' | 'proteins' | 'both'>('disposables');
  const [monthlySpend, setMonthlySpend] = useState(12000);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const calculateSavings = () => {
    // Simplified calculation logic - adjust based on actual business model
    const freightSavingsPercent = productType === 'both' ? 0.08 : 0.06;
    const pricingSavingsPercent = productType === 'proteins' ? 0.12 : 0.10;
    
    const annualSpend = monthlySpend * 12;
    const freightSavings = annualSpend * freightSavingsPercent;
    const pricingSavings = annualSpend * pricingSavingsPercent;
    
    setResults({
      freightSavings: Math.round(freightSavings),
      pricingSavings: Math.round(pricingSavings),
      totalAnnualSavings: Math.round(freightSavings + pricingSavings)
    });
    setShowResults(true);
  };

  const handleRequestQuote = () => {
    const data: CalculatorData = {
      productType,
      monthlySpend,
      city,
      state
    };
    
    if (onRequestQuote) {
      onRequestQuote(data);
    }
    
    // Dispatch custom event for form to pick up
    window.dispatchEvent(new CustomEvent('calculator-quote-request', { 
      detail: data 
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <section className="py-16 bg-slate-50" id="calculator">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Calculate Your Potential Savings</h2>
            <p className="text-slate-600">
              See how much you could save with Atlanta warehouse-direct pricing delivered to {city}.
            </p>
          </div>
          
          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Inputs */}
                <div className="space-y-8">
                  <div>
                    <Label className="text-base font-medium mb-4 block">
                      What are you looking to purchase?
                    </Label>
                    <RadioGroup 
                      value={productType} 
                      onValueChange={(v) => setProductType(v as typeof productType)}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div>
                        <RadioGroupItem value="disposables" id="disposables" className="peer sr-only" />
                        <Label 
                          htmlFor="disposables"
                          className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-slate-50"
                        >
                          <span className="text-2xl mb-2">📦</span>
                          <span className="text-sm font-medium">Disposables</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="proteins" id="proteins" className="peer sr-only" />
                        <Label 
                          htmlFor="proteins"
                          className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-slate-50"
                        >
                          <span className="text-2xl mb-2">🥩</span>
                          <span className="text-sm font-medium">Proteins</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="both" id="both" className="peer sr-only" />
                        <Label 
                          htmlFor="both"
                          className="flex flex-col items-center justify-center p-4 border-2 rounded-lg cursor-pointer peer-checked:border-orange-500 peer-checked:bg-orange-50 hover:bg-slate-50"
                        >
                          <span className="text-2xl mb-2">📦🥩</span>
                          <span className="text-sm font-medium">Both</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium mb-4 block">
                      Estimated monthly spend: {formatCurrency(monthlySpend)}
                    </Label>
                    <Slider
                      value={[monthlySpend]}
                      onValueChange={([v]) => setMonthlySpend(v)}
                      min={3000}
                      max={100000}
                      step={1000}
                      className="py-4"
                    />
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>$3,000</span>
                      <span>$100,000</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-base font-medium mb-2 block">Your location</Label>
                    <div className="p-3 bg-slate-100 rounded-md text-slate-700">
                      {city}, {state}
                      <span className="text-slate-500 text-sm ml-2">
                        ({distanceFromAtlanta} miles from Atlanta)
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={calculateSavings}
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    size="lg"
                  >
                    Calculate Savings →
                  </Button>
                </div>
                
                {/* Results */}
                <div className={`${showResults ? 'opacity-100' : 'opacity-50'}`}>
                  {showResults && results ? (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">
                        Based on {formatCurrency(monthlySpend)}/month to {city}:
                      </h3>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(results.freightSavings)}
                          </div>
                          <div className="text-sm text-green-700">Freight Savings</div>
                          <div className="text-xs text-green-600">/year</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(results.pricingSavings)}
                          </div>
                          <div className="text-sm text-green-700">Pricing Savings</div>
                          <div className="text-xs text-green-600">/year</div>
                        </div>
                        <div className="bg-orange-100 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(results.totalAnnualSavings)}
                          </div>
                          <div className="text-sm text-orange-700">Total Savings</div>
                          <div className="text-xs text-orange-600">/year</div>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                        ⚠️ This is an estimate based on typical savings. Your actual savings depend on your specific product mix and current pricing.
                      </div>
                      
                      <Button 
                        onClick={handleRequestQuote}
                        className="w-full"
                        size="lg"
                      >
                        Get Your Custom Quote →
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📊</div>
                        <div>Enter your details and click calculate to see potential savings</div>
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </section>
  );
}
```

---

## SECTION 6: MULTI-STEP LEAD CAPTURE FORM

### Purpose
Convert interested visitors with a multi-step form (86% higher conversion than single-step).

### Component: `MultiStepLeadForm.tsx`

```tsx
// src/components/landing/MultiStepLeadForm.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

interface Props {
  city: string;
  state: string;
  minimumOrder: string;
}

type BusinessType = 'restaurant' | 'food_truck' | 'caterer' | 'institution' | 'grocery' | 'other';
type ProductCategory = 'disposables' | 'custom_print' | 'proteins' | 'eco_friendly';
type SpendRange = 'under_3k' | '3k_10k' | '10k_25k' | 'over_25k';

interface FormData {
  // Step 1
  businessType: BusinessType | null;
  
  // Step 2
  productInterests: ProductCategory[];
  estimatedSpend: SpendRange | null;
  
  // Step 3
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  
  // Meta
  city: string;
  state: string;
  source: string;
  calculatorData?: any;
}

const BUSINESS_TYPES: { value: BusinessType; label: string; icon: string }[] = [
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { value: 'food_truck', label: 'Food Truck', icon: '🚚' },
  { value: 'caterer', label: 'Caterer', icon: '🎪' },
  { value: 'institution', label: 'Institution', icon: '🏢' },
  { value: 'grocery', label: 'Grocery', icon: '🛒' },
  { value: 'other', label: 'Other', icon: '➕' },
];

const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'disposables', label: 'Disposables (napkins, plates, cutlery, to-go containers)' },
  { value: 'custom_print', label: 'Custom Printed Products (cups, napkins, bags with your logo)' },
  { value: 'proteins', label: 'Proteins (beef, pork, poultry, seafood)' },
  { value: 'eco_friendly', label: 'Eco-Friendly Alternatives' },
];

const SPEND_RANGES: { value: SpendRange; label: string }[] = [
  { value: 'under_3k', label: 'Under $3,000' },
  { value: '3k_10k', label: '$3,000 - $10,000' },
  { value: '10k_25k', label: '$10,000 - $25,000' },
  { value: 'over_25k', label: 'Over $25,000' },
];

export default function MultiStepLeadForm({ city, state, minimumOrder }: Props) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    businessType: null,
    productInterests: [],
    estimatedSpend: null,
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    city,
    state,
    source: 'city_landing_page',
  });

  // Listen for calculator data
  useEffect(() => {
    const handleCalculatorData = (e: CustomEvent) => {
      const { productType, monthlySpend } = e.detail;
      
      // Map calculator data to form data
      const productInterests: ProductCategory[] = [];
      if (productType === 'disposables' || productType === 'both') {
        productInterests.push('disposables');
      }
      if (productType === 'proteins' || productType === 'both') {
        productInterests.push('proteins');
      }
      
      let estimatedSpend: SpendRange = '3k_10k';
      if (monthlySpend < 3000) estimatedSpend = 'under_3k';
      else if (monthlySpend < 10000) estimatedSpend = '3k_10k';
      else if (monthlySpend < 25000) estimatedSpend = '10k_25k';
      else estimatedSpend = 'over_25k';
      
      setFormData(prev => ({
        ...prev,
        productInterests,
        estimatedSpend,
        calculatorData: e.detail,
        source: 'calculator'
      }));
      
      // Skip to step 3 if we have enough data
      setStep(3);
      
      // Scroll to form
      document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    window.addEventListener('calculator-quote-request', handleCalculatorData as EventListener);
    return () => {
      window.removeEventListener('calculator-quote-request', handleCalculatorData as EventListener);
    };
  }, []);

  const progress = (step / 3) * 100;

  const handleProductToggle = (category: ProductCategory) => {
    setFormData(prev => ({
      ...prev,
      productInterests: prev.productInterests.includes(category)
        ? prev.productInterests.filter(c => c !== category)
        : [...prev.productInterests, category]
    }));
  };

  const canProceedStep1 = formData.businessType !== null;
  const canProceedStep2 = formData.productInterests.length > 0 && formData.estimatedSpend !== null;
  const canSubmit = formData.businessName && formData.contactName && formData.email;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <section className="py-16 bg-orange-50" id="lead-form">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
            <p className="text-slate-600 mb-6">
              We've received your request and will get back to you within 24 hours (usually same day).
            </p>
            <p className="text-sm text-slate-500">
              Questions? Call us at <a href="tel:+1XXXXXXXXXX" className="text-orange-600">(XXX) XXX-XXXX</a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-orange-50" id="lead-form">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Get Your Custom Quote</h2>
            <p className="text-slate-600">
              Tell us about your business and we'll provide personalized pricing for {city}.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Step {step} of 3</span>
                <span>{step === 3 ? 'Almost done!' : ''}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Step 1: Business Type */}
            {step === 1 && (
              <div className="space-y-6">
                <Label className="text-base font-medium">What type of business are you?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {BUSINESS_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, businessType: type.value }))}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        formData.businessType === type.value
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl block mb-2">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!canProceedStep1}
                  className="w-full"
                >
                  Next →
                </Button>
              </div>
            )}
            
            {/* Step 2: Products & Budget */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-4 block">
                    What products are you looking for?
                  </Label>
                  <div className="space-y-3">
                    {PRODUCT_CATEGORIES.map((category) => (
                      <label
                        key={category.value}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.productInterests.includes(category.value)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Checkbox
                          checked={formData.productInterests.includes(category.value)}
                          onCheckedChange={() => handleProductToggle(category.value)}
                          className="mr-3"
                        />
                        <span className="text-sm">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-base font-medium mb-4 block">
                    Estimated monthly spend on these products:
                  </Label>
                  <RadioGroup
                    value={formData.estimatedSpend || ''}
                    onValueChange={(v) => setFormData(prev => ({ ...prev, estimatedSpend: v as SpendRange }))}
                    className="space-y-3"
                  >
                    {SPEND_RANGES.map((range) => (
                      <label
                        key={range.value}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.estimatedSpend === range.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <RadioGroupItem value={range.value} className="mr-3" />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    disabled={!canProceedStep2}
                    className="flex-1"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Contact Info */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Your Business Name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactName">Your Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                    placeholder="Your Name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="you@business.com"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone (optional - for faster response)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(XXX) XXX-XXXX"
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    ← Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!canSubmit || isSubmitting}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    {isSubmitting ? 'Submitting...' : 'Get My Custom Quote →'}
                  </Button>
                </div>
                
                <div className="text-center text-sm text-slate-500 space-y-1">
                  <p>🔒 We never share your information.</p>
                  <p>📞 Expect a response within 24 hours (usually same day).</p>
                </div>
              </div>
            )}
            
          </div>
          
          <p className="text-center text-sm text-slate-500 mt-6">
            Or call us directly: <a href="tel:+1XXXXXXXXXX" className="text-orange-600 font-medium">(XXX) XXX-XXXX</a>
          </p>
          
        </div>
      </div>
    </section>
  );
}
```

---

## SUPABASE EDGE FUNCTION: MARKET DATA

```typescript
// supabase/functions/market-data/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EIA_API_KEY = Deno.env.get('EIA_API_KEY');

interface MarketDataResponse {
  poultry: CommodityData;
  beef: CommodityData;
  cookingOil: CommodityData;
  sugar: CommodityData;
  diesel: { price: number; previousWeek: number; region: string };
  oceanFreight: FreightData;
  updatedAt: string;
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const cacheKey = 'market-data-full';
  
  // Check cache
  const { data: cached } = await supabase
    .from('api_cache')
    .select('data, expires_at')
    .eq('cache_key', cacheKey)
    .single();

  if (cached && new Date(cached.expires_at) > new Date()) {
    return new Response(JSON.stringify(cached.data), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Fetch all data in parallel
  const [poultry, beef, diesel, oilCrops] = await Promise.all([
    fetchUSDAPoultry(),
    fetchUSDABeef(),
    fetchEIADiesel(),
    fetchUSDAOilCrops()
  ]);

  const marketData: MarketDataResponse = {
    poultry,
    beef,
    cookingOil: oilCrops.cookingOil,
    sugar: oilCrops.sugar,
    diesel,
    oceanFreight: getOceanFreightData(), // Freightos or cached data
    updatedAt: new Date().toISOString()
  };

  // Cache for 4 hours (daily data doesn't change frequently)
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);
  await supabase.from('api_cache').upsert({
    cache_key: cacheKey,
    api_source: 'aggregated',
    data: marketData,
    expires_at: expiresAt.toISOString()
  });

  // Also store historical for trend calculations
  await supabase.from('market_data_history').insert({
    data: marketData,
    captured_at: new Date().toISOString()
  });

  return new Response(JSON.stringify(marketData), {
    headers: { 'Content-Type': 'application/json' }
  });
});

async function fetchUSDAPoultry() {
  // USDA LMPR Report 2462 - Chicken Parts
  const response = await fetch(
    'https://mpr.datamart.ams.usda.gov/services/v1.1/reports/2462?filter={"filters":[{"fieldName":"report_date","operatorType":"GREATER","values":["' + 
    getDateDaysAgo(7) + '"]}]}'
  );
  const data = await response.json();
  
  // Process and return structured data
  return {
    items: [
      { name: 'Whole Chicken', price: extractPrice(data, 'whole'), unit: 'lb', change: calculateChange(data, 'whole') },
      { name: 'Wings', price: extractPrice(data, 'wings'), unit: 'lb', change: calculateChange(data, 'wings') },
      { name: 'Breast', price: extractPrice(data, 'breast'), unit: 'lb', change: calculateChange(data, 'breast') }
    ],
    source: 'USDA LMPR'
  };
}

async function fetchUSDABeef() {
  // USDA LMPR Report 2461 - Boxed Beef
  const response = await fetch(
    'https://mpr.datamart.ams.usda.gov/services/v1.1/reports/2461'
  );
  const data = await response.json();
  
  return {
    items: [
      { name: 'Choice Cutout', price: extractBeefPrice(data, 'choice'), unit: 'cwt', change: 0 },
      { name: 'Select Cutout', price: extractBeefPrice(data, 'select'), unit: 'cwt', change: 0 }
    ],
    source: 'USDA LMPR'
  };
}

async function fetchEIADiesel() {
  // EIA Weekly Retail Gasoline and Diesel Prices
  const response = await fetch(
    `https://api.eia.gov/v2/petroleum/pri/gnd/data/?api_key=${EIA_API_KEY}&facets[product][]=EPD2D&facets[duession][]=PG3&frequency=weekly&sort[0][column]=period&sort[0][direction]=desc&length=2`
  );
  const data = await response.json();
  
  const prices = data.response?.data || [];
  return {
    price: prices[0]?.value || 3.50,
    previousWeek: prices[1]?.value || 3.50,
    region: 'Lower Atlantic (PADD 1C)'
  };
}

async function fetchUSDAOilCrops() {
  // USDA ERS Oil Crops data - this would need to be from their published tables
  // For now, return structure with placeholder data
  return {
    cookingOil: {
      items: [
        { name: 'Soybean Oil', price: 0.52, unit: 'lb', change: -1.8 },
        { name: 'Canola Oil', price: 0.48, unit: 'lb', change: -0.5 }
      ],
      source: 'USDA ERS'
    },
    sugar: {
      items: [
        { name: 'Raw Cane (US)', price: 0.42, unit: 'lb', change: 0 },
        { name: 'World Price', price: 0.21, unit: 'lb', change: 1.2 }
      ],
      source: 'USDA ERS'
    }
  };
}

function getOceanFreightData() {
  // Freightos FBX or cached data
  return {
    routes: [
      { origin: 'China', destination: 'Savannah', rate: 2340, change: -12, unit: '40ft' },
      { origin: 'Vietnam', destination: 'Savannah', rate: 2180, change: -8, unit: '40ft' }
    ],
    source: 'Freightos FBX'
  };
}

// Helper functions
function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

function extractPrice(data: any, product: string): number {
  // Implementation depends on USDA API response structure
  return 0;
}

function calculateChange(data: any, product: string): number {
  // Calculate week-over-week change
  return 0;
}

function extractBeefPrice(data: any, grade: string): number {
  // Implementation depends on USDA API response structure
  return 0;
}
```

---

## DATABASE SCHEMA

```sql
-- Cache table for API responses
CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  api_source TEXT NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_cache_key ON api_cache(cache_key);
CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);

-- Historical market data for trends
CREATE TABLE market_data_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_market_history_date ON market_data_history(captured_at);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contact info
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Qualification
  business_type TEXT,
  product_interests TEXT[],
  estimated_spend TEXT,
  
  -- Location
  city TEXT,
  state TEXT,
  
  -- Meta
  source TEXT DEFAULT 'website',
  calculator_data JSONB,
  
  -- Status
  lead_score INTEGER DEFAULT 0,
  lead_status TEXT DEFAULT 'new'
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created ON leads(created_at);

-- Email subscriptions (micro captures)
CREATE TABLE email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NOT NULL, -- market_dashboard, recalls, exit_intent
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(email, source)
);
```

---

## ASTRO PAGE INTEGRATION

```astro
---
// src/pages/food-service-distribution/[state]/[city].astro
export const prerender = false; // Enable SSR for fresh data

import CityLandingLayout from '@/layouts/CityLandingLayout.astro';
import RecallAlertBar from '@/components/landing/RecallAlertBar.astro';
import HeroWithMarketSnapshot from '@/components/landing/HeroWithMarketSnapshot.astro';
import DeliveryInfoBar from '@/components/landing/DeliveryInfoBar.astro';
import MarketDashboard from '@/components/landing/MarketDashboard.astro';
import CostCalculator from '@/components/landing/CostCalculator';
import MultiStepLeadForm from '@/components/landing/MultiStepLeadForm';
import ValuePropositions from '@/components/landing/ValuePropositions.astro';
import ProductCategories from '@/components/landing/ProductCategories.astro';
import RecallsSection from '@/components/landing/RecallsSection.astro';
import LocalMarketSection from '@/components/landing/LocalMarketSection.astro';
import SocialProof from '@/components/landing/SocialProof.astro';
import NearbyCities from '@/components/landing/NearbyCities.astro';
import FooterCTA from '@/components/landing/FooterCTA.astro';
import StickyLeadCapture from '@/components/landing/StickyLeadCapture';
import ExitIntentPopup from '@/components/landing/ExitIntentPopup';

import { supabase } from '@/lib/supabase';
import { getCityData } from '@/lib/city-data';

const { state, city } = Astro.params;

// Get city configuration
const cityData = await getCityData(state!, city!);

if (!cityData) {
  return Astro.redirect('/404');
}

// Fetch market data from Edge Function
const { data: marketData } = await supabase.functions.invoke('market-data');

// Fetch recalls for this state
const { data: recallData } = await supabase.functions.invoke('recalls', {
  body: { state: cityData.state }
});

const recalls = recallData?.recalls || [];
---

<CityLandingLayout 
  title={`Food Service Distribution in ${cityData.city}, ${cityData.stateAbbr}`}
  description={`${cityData.deliveryMethod} to ${cityData.city}. Disposables, proteins, and custom print. ${cityData.minimumOrder} minimum.`}
>
  
  <!-- Section 1: Recall Alert Bar -->
  <RecallAlertBar recalls={recalls} state={cityData.state} />
  
  <!-- Section 2: Hero + Market Snapshot -->
  <HeroWithMarketSnapshot
    city={cityData.city}
    state={cityData.state}
    stateAbbr={cityData.stateAbbr}
    subheadline={cityData.heroSubheadline}
    trustBadges={cityData.trustBadges}
    marketData={{
      chicken: marketData.poultry.items[0],
      cookingOil: marketData.cookingOil.items[0],
      diesel: marketData.diesel,
      updatedAt: marketData.updatedAt
    }}
  />
  
  <!-- Section 3: Delivery Info Bar -->
  <DeliveryInfoBar
    deliveryMethod={cityData.deliveryMethod}
    deliveryIcon={cityData.deliveryIcon}
    deliveryFrequency={cityData.deliveryFrequency}
    leadTime={cityData.leadTime}
    minimumOrder={cityData.minimumOrder}
    dieselPrice={marketData.diesel.price}
  />
  
  <!-- Section 4: Market Intelligence Dashboard -->
  <MarketDashboard
    city={cityData.city}
    marketData={marketData}
    distanceFromAtlanta={cityData.distanceFromAtlanta}
  />
  
  <!-- Section 5: Cost Calculator (React Island) -->
  <CostCalculator
    client:visible
    city={cityData.city}
    state={cityData.state}
    distanceFromAtlanta={cityData.distanceFromAtlanta}
    dieselPrice={marketData.diesel.price}
  />
  
  <!-- Section 6: Lead Capture Form (React Island) -->
  <MultiStepLeadForm
    client:visible
    city={cityData.city}
    state={cityData.state}
    minimumOrder={cityData.minimumOrder}
  />
  
  <!-- Section 7: Value Propositions -->
  <ValuePropositions
    tier={cityData.tier}
    minimumOrder={cityData.minimumOrder}
  />
  
  <!-- Section 8: Product Categories -->
  <ProductCategories />
  
  <!-- Section 9: Active Recalls Section -->
  <RecallsSection
    recalls={recalls}
    state={cityData.state}
  />
  
  <!-- Section 10: Local Market Section -->
  <LocalMarketSection
    city={cityData.city}
    state={cityData.state}
    serviceRadius={cityData.serviceRadius}
    institutionalAnchors={cityData.institutionalAnchors}
    marketStats={cityData.marketStats}
    compliance={cityData.compliance}
  />
  
  <!-- Section 11: Social Proof -->
  <SocialProof
    testimonial={cityData.testimonial}
    certifications={cityData.certifications}
  />
  
  <!-- Section 12: Nearby Cities -->
  <NearbyCities
    currentCity={cityData.city}
    state={cityData.state}
    nearbyCities={cityData.nearbyCities}
  />
  
  <!-- Section 13: Footer CTA -->
  <FooterCTA phoneNumber={cityData.phoneNumber} />
  
  <!-- Persistent Elements -->
  <StickyLeadCapture client:idle />
  <ExitIntentPopup client:idle city={cityData.city} />
  
</CityLandingLayout>
```

---

## IMPLEMENTATION PRIORITY

### Phase 1: Data Infrastructure (Week 1)
1. Create Supabase tables (api_cache, market_data_history, leads, email_subscriptions)
2. Build market-data Edge Function with USDA and EIA integrations
3. Build recalls Edge Function with FDA API integration
4. Set up pg_cron for scheduled data refresh

### Phase 2: Core Components (Week 2)
1. RecallAlertBar component
2. HeroWithMarketSnapshot component
3. MarketSnapshot component
4. Enhanced DeliveryInfoBar with fuel surcharge

### Phase 3: Market Dashboard (Week 3)
1. MarketDashboard component
2. CommodityCard component
3. MicroEmailCapture component
4. Wire up all market data

### Phase 4: Calculator & Form (Week 4)
1. CostCalculator React component
2. MultiStepLeadForm React component
3. Calculator-to-form data passing
4. Lead submission Edge Function

### Phase 5: Persistent Elements (Week 5)
1. StickyLeadCapture component
2. ExitIntentPopup component
3. Mobile sticky bottom bar
4. Testing and polish

### Phase 6: Rollout (Week 6+)
1. Deploy to staging
2. Test all 156 city configurations
3. A/B testing setup
4. Production deployment

---

## TESTING CHECKLIST

- [ ] Recall bar displays correctly with active recalls
- [ ] Recall bar shows "no recalls" state correctly
- [ ] Market snapshot displays current prices
- [ ] Market data updates on page refresh
- [ ] Fuel surcharge calculates correctly
- [ ] All commodity cards display properly
- [ ] Calculator produces reasonable estimates
- [ ] Calculator data passes to lead form
- [ ] Multi-step form progresses correctly
- [ ] Form submission creates lead in database
- [ ] Email captures work (micro captures)
- [ ] Sticky sidebar appears after scroll
- [ ] Mobile bottom bar appears correctly
- [ ] Exit intent popup triggers appropriately
- [ ] All links and CTAs work
- [ ] Page loads under 3 seconds
- [ ] Mobile responsive at all breakpoints

---

## NOTES FOR CLAUDE CODE

1. **Use Astro's hybrid rendering** - Set `export const prerender = false` for pages that need fresh market data
2. **React islands for interactivity** - Use `client:visible` or `client:idle` directives
3. **Cache API responses** - Always check cache before fetching, use appropriate TTLs
4. **Error handling** - Gracefully handle API failures with fallback data
5. **Mobile-first** - Test all components on mobile viewports
6. **Accessibility** - Ensure proper ARIA labels, keyboard navigation
7. **SEO** - Include structured data for prices, update timestamps
8. **Performance** - Lazy load below-fold components, optimize images

The goal is to transform these pages from static brochures into living market intelligence resources that give visitors reasons to return while capturing leads at multiple commitment levels.
