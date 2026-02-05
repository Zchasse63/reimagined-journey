# Value Source - Food Service Distribution Platform

Lead generation platform for food service distribution targeting restaurants, caterers, and food trucks across the Southeast US. Features market data dashboards, freight calculators, and multi-step lead capture.

## Architecture

```
reimagined-journey/
├── apps/web/                 # Astro 5.x SSR app
│   └── src/
│       ├── pages/            # Routes + API endpoints
│       │   ├── api/          # submit-lead.ts, subscribe.ts
│       │   └── [state]/      # Dynamic city pages (156 cities)
│       ├── components/       # React islands + Astro components
│       ├── lib/              # Supabase client, market-data, recalls
│       └── types/            # TypeScript definitions
├── packages/data/            # Shared city data (@value-source/data)
├── supabase/
│   ├── functions/            # 7 edge functions (market-data, recalls, usda-prices, etc.)
│   └── migrations/           # 7 SQL migrations
└── tests/                    # Playwright E2E
```

## Tech Stack

- **Framework:** Astro 5.16.14 (hybrid SSR) + React 18.2 islands
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **Database:** Supabase (PostgreSQL + RLS + Edge Functions)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Deploy:** Netlify with `@astrojs/netlify` adapter
- **Monorepo:** Turborepo with npm workspaces

## Key Files

**API Endpoints:**
- [apps/web/src/pages/api/submit-lead.ts](apps/web/src/pages/api/submit-lead.ts) - Lead form POST (rate limiting, honeypot, Zod validation, camelCase→snake_case transform)
- [apps/web/src/pages/api/subscribe.ts](apps/web/src/pages/api/subscribe.ts) - Email subscription POST

**Pages:**
- [apps/web/src/pages/index.astro](apps/web/src/pages/index.astro) - Homepage with market dashboard, calculators, lead form
- [apps/web/src/pages/[state]/index.astro](apps/web/src/pages/[state]/index.astro) - State landing pages
- [apps/web/src/pages/[state]/[city].astro](apps/web/src/pages/[state]/[city].astro) - City-specific pages

**Components:**
- [apps/web/src/components/forms/LeadForm.tsx](apps/web/src/components/forms/LeadForm.tsx) - 3-step lead form
- [apps/web/src/components/forms/lead-form-schema.ts](apps/web/src/components/forms/lead-form-schema.ts) - Zod schemas
- [apps/web/src/components/landing/FreightCalculator.tsx](apps/web/src/components/landing/FreightCalculator.tsx) - ZIP-to-ZIP freight estimates

**Data Layer:**
- [apps/web/src/lib/market-data.ts](apps/web/src/lib/market-data.ts) - Market data fetch + FALLBACK_MARKET_DATA
- [apps/web/src/lib/recalls.ts](apps/web/src/lib/recalls.ts) - FDA recall fetch + fallbacks
- [apps/web/src/lib/supabase.ts](apps/web/src/lib/supabase.ts) - Client initialization

**Shared Package:**
- [packages/data/src/cities.ts](packages/data/src/cities.ts) - getCityBySlug, getAllStates, getNearbyCities
- [packages/data/src/tier-config.ts](packages/data/src/tier-config.ts) - Order minimum tiers

**Edge Functions:**
- [supabase/functions/market-data/index.ts](supabase/functions/market-data/index.ts) - Aggregates USDA, EIA, freight data (810 lines)
- [supabase/functions/usda-prices/index.ts](supabase/functions/usda-prices/index.ts) - Protein prices from AMS DataMart
- [supabase/functions/recalls/index.ts](supabase/functions/recalls/index.ts) - FDA recall data
- [supabase/functions/diesel-prices/index.ts](supabase/functions/diesel-prices/index.ts) - EIA diesel prices

## Database Tables

- `leads` - Lead captures with auto-scoring trigger, RLS (public INSERT, auth READ/UPDATE)
- `email_subscriptions` - Newsletter signups with verification tokens
- `api_cache` - Response caching with TTL (get_cached_data, set_cached_data functions)
- `market_data_history` - Historical snapshots for trend analysis
- `historical_prices` - Commodity price tracking
- `lead_webhook` - Webhook event logging
- `scheduled_jobs` - Background job management

## Patterns & Conventions

- **Path aliases:** `@/` → `src/`, `@components/`, `@lib/`, `@layouts/`
- **Package imports:** `@value-source/data` for shared city data
- **React islands:** Use `client:load`, `client:visible`, `client:idle` directives
- **Data fetching:** SSR fetch in Astro frontmatter with fallback constants
- **Form data:** camelCase in frontend, snake_case in database (API transforms)
- **Security:** Honeypot field, rate limiting, CORS, Zod validation, RLS policies

## Current State

**Working:**
- Lead form submission with full validation pipeline
- Email subscription with duplicate prevention
- 156 dynamic city pages
- Freight calculator with ZIP region mapping
- Market dashboard with fallback data
- Recalls section (FDA integration)
- Lead scoring (frontend + DB triggers)

**Needs Production Upgrade:**
- Rate limiting uses in-memory Map (needs Redis/Upstash for distributed)
- Edge functions need deployment + API key configuration

## Development

```bash
npm run dev          # Dev server (localhost:4321)
npm run build        # Production build
npm run typecheck    # TypeScript check
npm test             # Playwright E2E
npm run db:migrate   # Push Supabase migrations
npm run db:generate  # Generate DB types
```

**Required env vars:**
- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`
- `PUBLIC_SITE_URL` (for CORS)

**Optional:** `EIA_API_KEY`, `FDA_API_KEY`, `BLS_API_KEY`, `CENSUS_API_KEY`
