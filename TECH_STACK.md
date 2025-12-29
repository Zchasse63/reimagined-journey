# Technical Stack & Architecture

## Overview

This document details the technical architecture for the food service distribution lead generation platform. The stack prioritizes **developer velocity**, **SEO performance**, and **scalability** for programmatic page generation.

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | **Astro v4+** | Static-first with islands architecture |
| Styling | **Tailwind CSS v3+** | Utility-first design system |
| Components | **shadcn/ui + React** | Accessible, customizable UI components |
| Backend | **Supabase** | PostgreSQL, Auth, Edge Functions, Realtime |
| Hosting | **Netlify** | CDN, serverless functions, forms |
| Monorepo | **Turborepo** | Build caching, workspace management |
| Charts | **Recharts** | Calculator visualizations |
| Forms | **React Hook Form + Zod** | Form handling and validation |
| Icons | **Lucide React** | Consistent icon library |

---

## Why Astro

Astro is purpose-built for content-heavy sites with selective interactivity—exactly what this platform requires.

### Key Advantages

1. **Zero JavaScript by Default**: Static HTML renders instantly for SEO crawlers
2. **Islands Architecture**: Hydrate only interactive components (calculators, forms)
3. **Build Performance**: ~7.4s for 1,000 pages vs ~22s for Next.js
4. **Content Layer API v5**: Caching between builds, suitable for 10,000+ pages
5. **Netlify Partnership**: First-class integration, joint Server Islands development

### Build Performance Comparison

| Framework | 1,000 pages | 4,000 pages | JS per page |
|-----------|-------------|-------------|-------------|
| **Astro** | ~7.4s | ~22s | Zero (static) |
| Eleventy | ~1.9s | ~5.5s | Zero (static) |
| Next.js | ~22s | ~70s+ | Bundle required |
| SvelteKit | Variable | Memory issues | Minimal |

### Islands Architecture Example

```astro
---
// src/pages/[state]/[city].astro
import Layout from '../../layouts/Layout.astro';
import Hero from '../../components/Hero.astro';
import DeliveryBar from '../../components/DeliveryBar.astro';
import ValueProps from '../../components/ValueProps.astro';
import LocalMarket from '../../components/LocalMarket.astro';

// Interactive components hydrated client-side
import PricingCalculator from '../../components/PricingCalculator';
import LeadForm from '../../components/LeadForm';

const { city, state } = Astro.params;
const cityData = await getCityData(city, state);
---

<Layout title={`Food Service Distribution in ${cityData.name}, ${cityData.state}`}>
  <!-- Static components - zero JS -->
  <Hero city={cityData} />
  <DeliveryBar tier={cityData.tier} />
  <ValueProps tier={cityData.tier} />
  <LocalMarket data={cityData} />
  
  <!-- Interactive components - hydrated on load -->
  <PricingCalculator client:load city={cityData.name} />
  <LeadForm client:visible city={cityData.name} state={cityData.state} />
</Layout>
```

---

## Project Structure

```
/
├── apps/
│   └── web/                          # Astro application
│       ├── src/
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui components
│       │   │   │   ├── button.tsx
│       │   │   │   ├── card.tsx
│       │   │   │   ├── form.tsx
│       │   │   │   ├── input.tsx
│       │   │   │   └── select.tsx
│       │   │   ├── calculators/      # Interactive calculators
│       │   │   │   ├── PricingCalculator.tsx
│       │   │   │   ├── FreightCalculator.tsx
│       │   │   │   └── TariffLookup.tsx
│       │   │   ├── forms/            # Lead capture forms
│       │   │   │   ├── LeadForm.tsx
│       │   │   │   ├── QuoteForm.tsx
│       │   │   │   └── FormSteps/
│       │   │   │       ├── BusinessType.tsx
│       │   │   │       ├── ServiceInfo.tsx
│       │   │   │       └── ContactDetails.tsx
│       │   │   └── layout/           # Layout components
│       │   │       ├── Header.astro
│       │   │       ├── Footer.astro
│       │   │       └── Navigation.astro
│       │   ├── layouts/
│       │   │   ├── Layout.astro      # Base layout
│       │   │   ├── CityLayout.astro  # City page layout
│       │   │   └── StateLayout.astro # State hub layout
│       │   ├── pages/
│       │   │   ├── index.astro       # Homepage
│       │   │   ├── [state]/
│       │   │   │   ├── index.astro   # State hub
│       │   │   │   └── [city].astro  # City pages
│       │   │   ├── calculators/
│       │   │   │   ├── pricing.astro
│       │   │   │   └── freight.astro
│       │   │   └── api/              # API routes (if needed)
│       │   ├── styles/
│       │   │   └── globals.css       # Tailwind + custom CSS
│       │   └── lib/
│       │       ├── supabase.ts       # Supabase client
│       │       ├── utils.ts          # Utility functions
│       │       └── seo.ts            # SEO helpers
│       ├── public/
│       │   ├── fonts/
│       │   ├── images/
│       │   └── robots.txt
│       ├── astro.config.mjs
│       ├── tailwind.config.js
│       └── tsconfig.json
│
├── packages/
│   ├── data/                         # Shared data utilities
│   │   ├── cities/
│   │   │   ├── georgia.json
│   │   │   ├── florida.json
│   │   │   └── ...
│   │   ├── states/
│   │   │   └── compliance.json
│   │   ├── schemas/
│   │   │   ├── city.ts
│   │   │   └── lead.ts
│   │   └── index.ts
│   │
│   ├── ui/                           # Shared UI (if multi-app)
│   │   └── components/
│   │
│   └── api/                          # API client utilities
│       ├── supabase/
│       │   └── client.ts
│       └── external/
│           ├── usda.ts
│           └── eia.ts
│
├── supabase/
│   ├── functions/                    # Edge Functions
│   │   ├── usda-lmpr/
│   │   │   └── index.ts
│   │   ├── eia-diesel/
│   │   │   └── index.ts
│   │   ├── notify-lead/
│   │   │   └── index.ts
│   │   └── api-proxy/
│   │       └── index.ts
│   ├── migrations/                   # Database migrations
│   │   ├── 001_leads.sql
│   │   ├── 002_api_cache.sql
│   │   └── 003_commodity_prices.sql
│   └── seed.sql
│
├── scripts/
│   ├── generate-cities.ts            # Generate city data
│   ├── fetch-census.ts               # Fetch Census API data
│   └── validate-data.ts              # Data validation
│
├── docs/                             # Documentation
│   ├── README.md
│   ├── DESIGN_GUIDE.md
│   ├── API_DATA_SOURCES.md
│   ├── CITY_TEMPLATE.md
│   └── TECH_STACK.md
│
├── turbo.json                        # Turborepo config
├── package.json                      # Root package.json
└── pnpm-workspace.yaml               # PNPM workspace config
```

---

## Configuration Files

### Astro Configuration

```javascript
// apps/web/astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://yourdomain.com',
  output: 'hybrid', // Static by default, opt-in to SSR
  adapter: netlify(),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@components': '/src/components',
        '@lib': '/src/lib',
        '@data': '../../packages/data',
      },
    },
  },
  // Build optimization
  build: {
    inlineStylesheets: 'auto',
  },
  // Prefetch for faster navigation
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
```

### Tailwind Configuration

```javascript
// apps/web/tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{astro,html,js,jsx,ts,tsx}',
    '../../packages/ui/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### Turborepo Configuration

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".astro/**"],
      "cache": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "outputs": []
    },
    "generate:cities": {
      "outputs": ["packages/data/cities/**"],
      "cache": true
    }
  }
}
```

### TypeScript Configuration

```json
// apps/web/tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"],
      "@data/*": ["../../packages/data/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  },
  "include": ["src/**/*", "env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Database Schema (Supabase)

### Complete Migration Files

```sql
-- migrations/001_leads.sql
-- Lead capture and management

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
  business_type TEXT NOT NULL, -- restaurant, food_truck, caterer, institution, grocery
  location_count INTEGER DEFAULT 1,
  
  -- Qualification
  service_territory TEXT,
  current_distributor TEXT,
  purchase_timeline TEXT, -- immediate, 1-3mo, 3-6mo, exploring
  primary_interest TEXT[], -- disposables, proteins, custom_print, eco_friendly
  
  -- Source Tracking
  source_city TEXT,
  source_state TEXT,
  source_page TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Processing
  lead_score INTEGER DEFAULT 0,
  lead_status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, lost
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for common queries
CREATE INDEX idx_leads_status ON leads(lead_status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);
CREATE INDEX idx_leads_source ON leads(source_city, source_state);
CREATE INDEX idx_leads_email ON leads(email);

-- Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public can insert (form submissions)
CREATE POLICY "Public lead submission" ON leads
  FOR INSERT TO anon WITH CHECK (true);

-- Only authenticated users can read
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

```sql
-- migrations/002_api_cache.sql
-- API response caching

CREATE TABLE api_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT UNIQUE NOT NULL,
  api_source TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes
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

-- Schedule cleanup (run via pg_cron or external scheduler)
-- SELECT cron.schedule('cleanup-cache', '0 * * * *', 'SELECT cleanup_expired_cache()');
```

```sql
-- migrations/003_commodity_prices.sql
-- Historical pricing data

CREATE TABLE commodity_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commodity_type TEXT NOT NULL,
  source TEXT NOT NULL,
  price_date DATE NOT NULL,
  price_low DECIMAL(10,2),
  price_high DECIMAL(10,2),
  price_avg DECIMAL(10,2),
  unit TEXT NOT NULL,
  grade TEXT,
  region TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(commodity_type, source, price_date, grade, region)
);

-- Indexes
CREATE INDEX idx_commodity_lookup 
  ON commodity_prices(commodity_type, price_date DESC);
CREATE INDEX idx_commodity_source 
  ON commodity_prices(source, price_date DESC);

-- API usage tracking
CREATE TABLE api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_source TEXT NOT NULL,
  call_date DATE NOT NULL DEFAULT CURRENT_DATE,
  call_count INTEGER DEFAULT 1,
  
  UNIQUE(api_source, call_date)
);

CREATE INDEX idx_usage_date ON api_usage(call_date DESC);
```

---

## City Data Schema

### TypeScript Types

```typescript
// packages/data/schemas/city.ts
export interface CityData {
  // Identifiers
  city: string;
  state: string;
  stateAbbr: string;
  slug: string;
  stateSlug: string;
  
  // Delivery
  tier: 'Hub' | 'Tier1_Route' | 'Tier2_Route' | 'Common_Carrier';
  deliveryMethod: string;
  deliveryFrequency: string;
  leadTime: string;
  minimumOrder: number;
  
  // Geography
  distanceFromAtlanta: string;
  driveTime?: string;
  interstateCorridors: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // Service Area
  serviceRadius: string[];
  nearbyCities: string[];
  
  // Institutional Anchors
  militaryBases?: string[];
  universities?: string[];
  hospitalSystems?: string[];
  tourismAttractions?: string[];
  
  // Market Data
  population?: number;
  restaurantCount?: number;
  foodserviceEstablishments?: number;
  dominantSegments?: string[];
  seasonalNotes?: string;
  
  // Compliance (state-level)
  ecoEmphasis: 'Low' | 'Medium' | 'High';
}

export interface StateCompliance {
  state: string;
  stateAbbr: string;
  hasFoamBan: boolean;
  hasPFASBan: boolean;
  hasEPR: boolean;
  complianceDeadlines?: string;
  complianceDetails?: string;
  ecoEmphasis: 'Low' | 'Medium' | 'High';
}
```

### Example City Data File

```json
// packages/data/cities/georgia.json
{
  "cities": [
    {
      "city": "Atlanta",
      "state": "Georgia",
      "stateAbbr": "GA",
      "slug": "atlanta",
      "stateSlug": "georgia",
      "tier": "Hub",
      "deliveryMethod": "Warehouse Pickup & Local Delivery",
      "deliveryFrequency": "Same-day / Next-day",
      "leadTime": "Order by 2 PM",
      "minimumOrder": 3000,
      "distanceFromAtlanta": "0 miles (Hub)",
      "interstateCorridors": ["I-85", "I-75", "I-20", "I-285"],
      "serviceRadius": ["Fulton", "DeKalb", "Cobb", "Gwinnett", "Clayton"],
      "nearbyCities": ["macon", "savannah", "athens", "rome"],
      "militaryBases": ["Dobbins ARB", "Fort Gillem"],
      "universities": ["Georgia Tech", "Georgia State", "Emory"],
      "hospitalSystems": ["Emory Healthcare", "Piedmont", "WellStar"],
      "tourismAttractions": ["World of Coca-Cola", "Georgia Aquarium"],
      "population": 498715,
      "restaurantCount": 12000,
      "ecoEmphasis": "Low"
    },
    {
      "city": "Savannah",
      "state": "Georgia",
      "stateAbbr": "GA",
      "slug": "savannah",
      "stateSlug": "georgia",
      "tier": "Tier1_Route",
      "deliveryMethod": "Route Truck Delivery",
      "deliveryFrequency": "Weekly Scheduled Routes",
      "leadTime": "Order by Thursday",
      "minimumOrder": 3000,
      "distanceFromAtlanta": "250 miles / 4 hours",
      "interstateCorridors": ["I-16", "I-95"],
      "serviceRadius": ["Chatham", "Effingham", "Bryan"],
      "nearbyCities": ["atlanta", "macon", "augusta", "charleston"],
      "militaryBases": ["Fort Stewart", "Hunter Army Airfield"],
      "universities": ["SCAD", "Georgia Southern Armstrong"],
      "hospitalSystems": ["Memorial Health", "St. Joseph's/Candler"],
      "tourismAttractions": ["Historic District", "River Street"],
      "ecoEmphasis": "Low"
    }
  ]
}
```

---

## Build & Deployment

### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "pnpm turbo build --filter=web"
  publish = "apps/web/dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--version"

# Production context
[context.production]
  environment = { NODE_ENV = "production" }

# Preview deploys
[context.deploy-preview]
  command = "pnpm turbo build --filter=web"

# Branch deploys
[context.branch-deploy]
  command = "pnpm turbo build --filter=web"

# Headers for caching
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Redirects
[[redirects]]
  from = "/food-service-distribution/*"
  to = "/:splat"
  status = 301

# Edge Functions (if needed)
[[edge_functions]]
  function = "geolocation"
  path = "/api/location"
```

### Build Strategy for Scale

For 156+ pages, use prioritized static generation:

```typescript
// apps/web/src/pages/[state]/[city].astro
---
import { getAllCities, getCityData } from '@data';
import CityLayout from '../../layouts/CityLayout.astro';

export async function getStaticPaths() {
  const cities = await getAllCities();
  
  // Priority cities built statically (top 50 by search volume)
  const priorityCities = cities.filter(c => c.priority === 'high');
  
  return priorityCities.map(city => ({
    params: { 
      state: city.stateSlug, 
      city: city.slug 
    },
    props: { city }
  }));
}

// Fallback for non-priority cities (built on-demand)
export const prerender = true;

const { city } = Astro.props;
---

<CityLayout city={city}>
  <!-- Page content -->
</CityLayout>
```

---

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone [repo-url]
cd food-service-platform

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Initialize Supabase
supabase init
supabase db push

# Generate city data
pnpm generate:cities

# Start development
pnpm dev
```

### Common Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm dev --filter=web       # Start only web app

# Build
pnpm build                  # Build all packages
pnpm build --filter=web     # Build only web app

# Testing
pnpm test                   # Run all tests
pnpm lint                   # Lint all packages
pnpm typecheck              # Type check all packages

# Data
pnpm generate:cities        # Generate city data files
pnpm validate:data          # Validate data integrity

# Supabase
supabase start              # Start local Supabase
supabase db push            # Push migrations
supabase functions serve    # Serve Edge Functions locally
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/calculator-pricing
# ... make changes
git add .
git commit -m "feat: add pricing calculator"
git push origin feature/calculator-pricing
# Create PR for review

# Branch naming
feature/[feature-name]     # New features
fix/[bug-description]      # Bug fixes
docs/[doc-name]           # Documentation
refactor/[area]           # Code refactoring
```

---

## Performance Targets

### Core Web Vitals

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Hero section load |
| FID (First Input Delay) | < 100ms | Form interaction |
| CLS (Cumulative Layout Shift) | < 0.1 | No layout shifts |
| TTFB (Time to First Byte) | < 200ms | Edge caching |

### Build Performance

| Metric | Target |
|--------|--------|
| Cold build (156 pages) | < 60 seconds |
| Incremental build | < 10 seconds |
| Page size (HTML) | < 50KB |
| Total page weight | < 200KB |

### Runtime Performance

| Metric | Target |
|--------|--------|
| Calculator load | < 1 second |
| Form submission | < 500ms |
| API response (cached) | < 100ms |
| API response (fresh) | < 2 seconds |

---

## Monitoring & Analytics

### Recommended Tools

| Tool | Purpose | Integration |
|------|---------|-------------|
| Netlify Analytics | Traffic, performance | Built-in |
| Sentry | Error tracking | `@sentry/astro` |
| Plausible | Privacy-focused analytics | Script tag |
| Google Search Console | SEO monitoring | Verification file |

### Key Metrics to Track

**Traffic**
- Page views by city
- Traffic sources (organic, direct, referral)
- Geographic distribution

**Conversion**
- Form starts vs completions
- Step-by-step dropoff
- Lead quality by source

**Technical**
- Core Web Vitals by page type
- API response times
- Cache hit rates
- Error rates

---

## Security Considerations

### API Security

1. **Never expose API keys in client code**
2. **Use Supabase Edge Functions** as proxy for all external APIs
3. **Implement rate limiting** per IP/user
4. **Validate all inputs** with Zod schemas

### Form Security

1. **CSRF protection** via Supabase tokens
2. **Honeypot fields** for bot detection
3. **Rate limit submissions** per IP
4. **Sanitize all inputs** before storage

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.freightos.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.supabase.co https://api.eia.gov;">
```

---

## Troubleshooting

### Common Issues

**Build fails with memory error**
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```

**Supabase Edge Functions not working locally**
```bash
# Ensure Docker is running
docker ps
# Restart Supabase
supabase stop && supabase start
```

**City pages not generating**
```bash
# Validate data files
pnpm validate:data
# Check for missing required fields
```

**Tailwind styles not applying**
```bash
# Clear caches
rm -rf apps/web/.astro
rm -rf node_modules/.cache
pnpm build
```
