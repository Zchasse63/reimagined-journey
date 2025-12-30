# Food Service Distribution Lead Generation Platform

## Project Overview

A **B2B lead generation and market intelligence platform** targeting the food service industry, specifically smaller distributors, ghost kitchens, food trucks, catering companies, and ethnic grocers across the Eastern United States. The platform positions itself as an educational resource site rather than a branded brokerage, providing market intelligence and pricing tools before connecting prospects with solutions.

### Business Model

```
┌─────────────────────────────────────────────────────────────────────┐
│  RESOURCE-FIRST LEAD GENERATION (Zillow Model for Food Service)    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. ATTRACT → Educational content, calculators, market data        │
│  2. ENGAGE  → City landing pages, pricing tools, compliance guides │
│  3. CAPTURE → Multi-step forms, quote requests, deal alerts        │
│  4. CONVERT → Speed-to-lead automation, CRM integration            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Geographic Coverage

- **Hub**: Atlanta (distribution center)
- **Tier 1 Routes**: Georgia, Alabama, Tennessee, South Carolina, Florida (north), Kentucky
- **Tier 2 Routes**: North Carolina, Mississippi, Virginia
- **Common Carrier**: Ohio, Indiana, Illinois, Missouri, Texas, Oklahoma

### Service Tiers & Minimums

| Tier | States | Delivery Method | Minimum Order |
|------|--------|-----------------|---------------|
| Hub | Atlanta metro | Same-day/next-day | $3,000 |
| Tier 1 ($3K) | GA, AL, TN, SC, FL (north), KY | Weekly route truck | $3,000 |
| Tier 1 ($5K) | FL (south of Tampa-Melbourne) | Weekly route truck | $5,000 |
| Tier 2 | NC, MS, VA | Weekly route truck | $5,000 |
| Common Carrier | OH, IN, IL, MO, TX, OK | Freight 3-5 days | $5,000 |

---

## Documentation Structure

```
/docs
├── README.md                    # This file - project overview
├── DESIGN_GUIDE.md             # Complete UI/UX specifications
├── API_DATA_SOURCES.md         # All API integrations and data sources
├── CITY_TEMPLATE.md            # Landing page content template
├── TECH_STACK.md               # Technical architecture details
└── /data
    └── food_service_city_data.xlsx  # City database (156 cities)
```

---

## Key Features to Build

### Phase 1: Foundation (Weeks 1-2)

1. **Project Setup**
   - Initialize Turborepo monorepo with Astro
   - Configure Supabase project (database, edge functions)
   - Set up Netlify deployment pipeline
   - Implement design system with Tailwind CSS

2. **Lead Capture System**
   - Multi-step quote request form
   - Database schema for leads
   - Real-time notifications (Slack, email, SMS)
   - Basic CRM webhook integration

3. **Core Pages**
   - Homepage
   - State hub pages (15 states)
   - Initial city pages (Georgia + Florida = 22 pages)

### Phase 2: Calculators & Tools (Weeks 3-4)

1. **API Proxy & Caching Layer**
   - Supabase Edge Functions for API calls
   - PostgreSQL cache with TTL management
   - Stale-while-revalidate pattern

2. **Market Intelligence Calculators**
   - Protein pricing calculator (USDA LMPR data)
   - Fuel surcharge calculator (EIA diesel prices)
   - Tariff lookup tool (USITC HTS API)
   - Ocean freight estimator (Freightos widgets)

### Phase 3: Location Pages (Weeks 5-8)

1. **Programmatic Page Generation**
   - Remaining 134 city pages
   - Hub-and-spoke internal linking
   - Dynamic content blocks per city

2. **SEO Infrastructure**
   - Schema markup (Service + areaServed)
   - XML sitemaps
   - Meta tag generation
   - Canonical URLs

### Phase 4: Optimization (Weeks 9-12)

1. **Conversion Optimization**
   - A/B testing framework
   - Lead scoring system
   - Progressive profiling
   - Thank you page optimization

2. **Performance**
   - Core Web Vitals optimization
   - Image optimization pipeline
   - ISR/On-demand regeneration

---

## Target Audience Segments

### Primary Targets (Underserved by Major Distributors)

| Segment | Market Size | Key Pain Points | Content Strategy |
|---------|-------------|-----------------|------------------|
| Ghost Kitchens | $88.4B market | Price-sensitive, need small quantities | "Supply Solutions for Virtual Restaurants" |
| Food Trucks | $4.52B market (48K+ active) | Irregular orders, flexible needs | "Flexible Ordering for Mobile Food Service" |
| Catering Companies | 8.8% CAGR | Event-based volume swings | "Event Supply Programs with No Minimums" |
| Ethnic Grocers | $58.9B market | Personal relationships, specialty products | "Specialty Product Sourcing" |

### Trigger Events (Real Estate Wholesaling Model)

1. **New Restaurant Openings** - 2,000+ leads/month from RestaurantData.com
2. **Supply Chain Disruptions** - 96% experienced delays (NRA data)
3. **Sustainability Regulations** - State-specific compliance deadlines
4. **Ownership Changes** - 90-day supplier review window
5. **Health Inspection Failures** - 5-14 day correction windows

---

## Competitive Positioning

### Why We Win

| Competitor Gap | Our Advantage |
|----------------|---------------|
| Sysco/US Foods ignore small accounts | $3K-5K minimums vs. their $10K+ |
| No local SEO from major distributors | City-specific landing pages |
| Opaque pricing industry-wide | USDA-based pricing transparency |
| Generic product focus | Custom print program differentiation |
| Slow, transactional relationships | Speed-to-lead (<60 second response) |

### Differentiators to Emphasize

1. **Lower Minimums** - "$3,000 minimum—lower than broadline distributors"
2. **Custom Print** - "Brand your business with custom-printed disposables"
3. **Local Expertise** - "We know [State] foodservice"
4. **Pricing Transparency** - "Prices based on USDA market data"
5. **Reliability** - "98%+ on-time delivery rate"

---

## Success Metrics

### Lead Generation KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Landing page conversion rate | 5%+ | Form submissions / page visitors |
| Lead response time | <60 seconds | Time to first contact |
| Form completion rate | 40%+ | Completed / started forms |
| Quote-to-customer rate | 15%+ | Closed deals / quotes sent |

### SEO KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Organic traffic growth | 20% MoM | Google Analytics |
| Keyword rankings (local) | Top 3 | "food distribution [city]" terms |
| Pages indexed | 156+ | Google Search Console |
| Core Web Vitals | All "Good" | PageSpeed Insights |

---

## Quick Start for Development

### Prerequisites

```bash
# Required tools
node >= 18.0.0
npm >= 9.0.0
python >= 3.9

# Required accounts
- Supabase project (https://supabase.com)
- Netlify account (https://netlify.com)
- API keys for: EIA, BLS, Census (all free)
```

### Initial Setup

```bash
# Clone and install
git clone [repo-url]
cd food-service-platform
npm install

# Environment setup
cp .env.example .env.local
# Add your API keys to .env.local

# Start development
npm run dev
```

### Project Structure

```
/
├── apps/
│   └── web/                     # Astro site
│       ├── src/
│       │   ├── pages/
│       │   │   ├── index.astro
│       │   │   └── [state]/[city].astro
│       │   ├── components/
│       │   │   ├── forms/
│       │   │   ├── calculators/
│       │   │   └── ui/
│       │   └── layouts/
│       └── astro.config.mjs
│
├── packages/
│   ├── ui/                      # shadcn/ui components
│   ├── data/                    # City/state data + utilities
│   └── api/                     # Supabase client, API utilities
│
├── supabase/
│   └── functions/               # Edge Functions
│       ├── pricing-data/
│       ├── notify-lead/
│       └── api-proxy/
│
└── docs/                        # Documentation (you are here)
```

---

## Related Documentation

- **[DESIGN_GUIDE.md](./DESIGN_GUIDE.md)** - Complete UI/UX specifications, colors, typography, components
- **[API_DATA_SOURCES.md](./API_DATA_SOURCES.md)** - All API endpoints, authentication, caching strategies
- **[CITY_TEMPLATE.md](./CITY_TEMPLATE.md)** - Landing page content template with variables
- **[TECH_STACK.md](./TECH_STACK.md)** - Technical architecture, framework details, build process

---

## License

Proprietary - Internal Use Only
