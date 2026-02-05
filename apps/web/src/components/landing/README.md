# Landing Page Components

Components for Value Source city/state landing pages and the main homepage.

## Component Types

- **Astro (.astro)** - Server-rendered, zero JS by default
- **React (.tsx)** - Interactive, requires `client:*` directive

## Component Reference

### Lead Capture

| Component | Type | Description |
|-----------|------|-------------|
| `MultiStepLeadForm` | React | Main lead form with business type, products, contact info. Tracks UTM params. |
| `StickyLeadCapture` | React | Floating sidebar (desktop) / bottom bar (mobile) quick form |
| `ExitIntentPopup` | React | Exit-intent triggered lead capture modal |
| `MicroEmailCapture` | Astro | Minimal email-only capture for embedding |

### Market Data

| Component | Type | Description |
|-----------|------|-------------|
| `MarketDashboard` | Astro | Full market data section with diesel, beef, trucking cards |
| `MarketSnapshot` | Astro | Compact market stats for hero sections |
| `CommodityCard` | Astro | Individual commodity price card |
| `FreightCalculator` | React | Distance-based freight cost estimator |
| `SeasonalInsights` | React | Seasonal buying guidance by month |

### Content Sections

| Component | Type | Description |
|-----------|------|-------------|
| `HeroWithMarketSnapshot` | Astro | City hero with embedded market data |
| `DeliveryInfoBar` | Astro | Route info with diesel/fuel surcharge |
| `ValuePropositions` | Astro | 4-card value prop grid |
| `ProductCategories` | Astro | Product category cards with items |
| `LocalMarketSection` | Astro | City-specific market content |
| `SocialProof` | Astro | Customer testimonials/stats |
| `NearbyCities` | Astro | Links to nearby city pages |
| `FAQSection` | Astro | Dynamic FAQs with Schema.org markup |
| `FooterCTA` | Astro | Bottom call-to-action section |

### Recalls/Alerts

| Component | Type | Description |
|-----------|------|-------------|
| `RecallAlertBar` | Astro | Top banner for active recalls |
| `RecallCard` | Astro | Individual recall display card |
| `RecallsSection` | Astro | Full recalls section with multiple cards |

## Usage Examples

### Astro Components
```astro
---
import MarketDashboard from '@/components/landing/MarketDashboard.astro';
import FAQSection from '@/components/landing/FAQSection.astro';
---

<MarketDashboard
  city="Atlanta"
  marketData={marketData}
  distanceFromAtlanta={0}
/>

<FAQSection
  city="Atlanta"
  state="Georgia"
  tier={1}
/>
```

### React Components (require client directive)
```astro
---
import MultiStepLeadForm from '@/components/landing/MultiStepLeadForm';
import FreightCalculator from '@/components/landing/FreightCalculator';
---

<!-- Lazy hydrate on visibility for performance -->
<MultiStepLeadForm
  client:visible
  city="Miami"
  state="FL"
  minimumOrder="$500"
/>

<FreightCalculator
  client:visible
  defaultOrigin="Atlanta, GA"
  dryVanRatePerMile={2.26}
  fuelSurchargePercent={43.2}
  dieselPrice={3.50}
/>
```

### Floating Lead Capture
```astro
---
import StickyLeadCapture from '@/components/landing/StickyLeadCapture';
---

<!-- Shows on lg+ as sidebar, mobile as bottom bar -->
<StickyLeadCapture
  client:idle
  phoneNumber="(404) 555-1234"
/>
```

## Props Reference

### MultiStepLeadForm
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `city` | string | - | Pre-fill city for lead |
| `state` | string | - | Pre-fill state for lead |
| `minimumOrder` | string | - | Display minimum order amount |

### FreightCalculator
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultOrigin` | string | "Atlanta, GA" | Starting point |
| `dryVanRatePerMile` | number | 2.26 | Dry van rate |
| `fuelSurchargePercent` | number | 43.2 | Current fuel surcharge |
| `dieselPrice` | number | 3.50 | Current diesel price |

### FAQSection
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `city` | string | required | City name for dynamic content |
| `state` | string | required | State name for dynamic content |
| `tier` | number | 1 | City tier (1-3) for content customization |

### MarketDashboard
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `city` | string | required | City name |
| `marketData` | MarketData | required | From fetchMarketData() |
| `distanceFromAtlanta` | number | 0 | Miles from hub |

## Data Dependencies

Components fetch data from Supabase Edge Functions:

- **market-data** - Diesel, beef, trucking rates (EIA, USDA APIs)
- **diesel-prices** - Historical diesel data for charts
- **recalls** - FDA recall data by state

See `/apps/web/src/lib/` for data fetching utilities.

## Performance Notes

- Use `client:visible` for below-fold React components
- Use `client:idle` for floating elements (StickyLeadCapture)
- Astro components are zero-JS, prefer when possible
- Market data cached for 1 hour via CDN headers
