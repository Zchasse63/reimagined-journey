# Implementation Checklist

## Quick Reference

This checklist guides the development team through implementing the food service distribution lead generation platform. Check off items as completed.

---

## Phase 1: Foundation (Weeks 1-2)

### Project Setup

- [ ] Initialize Turborepo monorepo
  ```bash
  npx create-turbo@latest food-service-platform
  cd food-service-platform
  pnpm install
  ```

- [ ] Configure Astro web app
  ```bash
  cd apps
  pnpm create astro@latest web
  # Select: Empty, TypeScript Strict, Install dependencies
  ```

- [ ] Install core dependencies
  ```bash
  cd apps/web
  pnpm add @astrojs/react @astrojs/tailwind @astrojs/sitemap @astrojs/netlify
  pnpm add react react-dom
  pnpm add -D tailwindcss postcss autoprefixer
  pnpm add lucide-react recharts
  ```

- [ ] Configure Tailwind CSS
  - [ ] Create `tailwind.config.js` with design system colors
  - [ ] Create `globals.css` with CSS variables
  - [ ] Add Inter font from Google Fonts

- [ ] Set up shadcn/ui
  ```bash
  npx shadcn-ui@latest init
  # Add components: button, card, form, input, select, badge
  ```

- [ ] Configure TypeScript paths
  - [ ] Update `tsconfig.json` with aliases
  - [ ] Create type definitions for city data

### Supabase Setup

- [ ] Create Supabase project
- [ ] Run database migrations
  - [ ] `001_leads.sql` - Lead capture table
  - [ ] `002_api_cache.sql` - API response cache
  - [ ] `003_commodity_prices.sql` - Pricing data
- [ ] Configure Row Level Security
- [ ] Set up Edge Functions directory structure
- [ ] Add environment variables to `.env.local`

### Netlify Setup

- [ ] Create Netlify site
- [ ] Connect to Git repository
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Configure custom domain (if ready)

### Lead Capture System

- [ ] Create lead form schema (Zod)
  ```typescript
  const leadSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    companyName: z.string().min(1),
    businessType: z.enum(['restaurant', 'food_truck', 'caterer', 'institution', 'grocery', 'other']),
    locationCount: z.number().min(1).optional(),
    serviceTerritory: z.string().optional(),
    primaryInterest: z.array(z.string()),
  });
  ```

- [ ] Build multi-step form component
  - [ ] Step 1: Business type (visual selectors)
  - [ ] Step 2: Service info (location, interests)
  - [ ] Step 3: Contact details
  - [ ] Progress indicator

- [ ] Implement form submission
  - [ ] Client-side validation
  - [ ] Supabase insert
  - [ ] Success/error handling
  - [ ] Thank you page redirect

- [ ] Set up notifications (Edge Function)
  - [ ] Slack webhook
  - [ ] Email notification (SendGrid/Resend)
  - [ ] SMS optional (Twilio)

### Core Pages

- [ ] Homepage (`index.astro`)
  - [ ] Hero section with value proposition
  - [ ] Service area overview
  - [ ] Product categories
  - [ ] Trust signals
  - [ ] Lead capture form

- [ ] State hub template (`[state]/index.astro`)
  - [ ] State-specific content
  - [ ] City listing with links
  - [ ] State compliance info (if applicable)

- [ ] City page template (`[state]/[city].astro`)
  - [ ] Hero with city name
  - [ ] Delivery info bar
  - [ ] Value propositions
  - [ ] Product categories
  - [ ] Local market section
  - [ ] Testimonial
  - [ ] Nearby cities
  - [ ] Lead capture form

### Data Package

- [ ] Create `packages/data` structure
- [ ] Export city data JSON files
  - [ ] `georgia.json`
  - [ ] `florida.json`
  - [ ] (Continue for all states)
- [ ] Create data access functions
  - [ ] `getAllCities()`
  - [ ] `getCityBySlug(state, city)`
  - [ ] `getCitiesByState(state)`
  - [ ] `getNearbyCities(city)`

---

## Phase 2: Calculators & Tools (Weeks 3-4)

### API Proxy Layer

- [ ] Create API cache table in Supabase
- [ ] Build Edge Function for USDA LMPR
  - [ ] Implement caching logic
  - [ ] Handle rate limits
  - [ ] Return standardized response
- [ ] Build Edge Function for EIA diesel
- [ ] Build Edge Function for USITC tariffs
- [ ] Build Edge Function for BLS PPI

### Pricing Calculator

- [ ] Create calculator component
  - [ ] Product type selector
  - [ ] Quantity input
  - [ ] Location input (for freight)
  - [ ] Price display with ranges
- [ ] Fetch USDA pricing data
- [ ] Display historical comparison
- [ ] Add disclaimer about market pricing

### Freight Calculator

- [ ] Embed Freightos widget
- [ ] Create wrapper component
- [ ] Style to match site design
- [ ] Add educational content

### Tariff Lookup Tool

- [ ] Build HTS code search
- [ ] Display tariff rates
- [ ] Show Section 301 additions for China
- [ ] Include AD/CVD indicators for seafood

---

## Phase 3: Location Pages (Weeks 5-8)

### Generate All City Pages

- [ ] Georgia (9 cities)
- [ ] Florida (13 cities)
- [ ] Alabama (10 cities)
- [ ] Tennessee (10 cities)
- [ ] South Carolina (10 cities)
- [ ] North Carolina (12 cities)
- [ ] Mississippi (10 cities)
- [ ] Kentucky (10 cities)
- [ ] Virginia (12 cities)
- [ ] Ohio (11 cities)
- [ ] Indiana (10 cities)
- [ ] Illinois (10 cities)
- [ ] Missouri (9 cities)
- [ ] Texas (12 cities)
- [ ] Oklahoma (8 cities)

### SEO Infrastructure

- [ ] Generate XML sitemap
- [ ] Configure sitemap in `astro.config.mjs`
- [ ] Create robots.txt
- [ ] Add canonical URLs to all pages
- [ ] Implement structured data (JSON-LD)
  - [ ] Organization schema (homepage)
  - [ ] Service schema (city pages)
  - [ ] BreadcrumbList schema

### Internal Linking

- [ ] State hub → City pages
- [ ] City pages → Nearby cities (4-6 each)
- [ ] City pages → Product categories
- [ ] City pages → Calculators
- [ ] Footer navigation

### Content Uniqueness

For each city page, ensure:
- [ ] Unique H1 with city + state
- [ ] Unique meta title (< 60 chars)
- [ ] Unique meta description (150-160 chars)
- [ ] Local institutional anchors
- [ ] Service radius description
- [ ] At least 500 words unique content

---

## Phase 4: Optimization (Weeks 9-12)

### Performance

- [ ] Audit with Lighthouse
- [ ] Optimize images
  - [ ] Use WebP format
  - [ ] Implement lazy loading
  - [ ] Size appropriately
- [ ] Preload critical assets
- [ ] Enable Netlify asset optimization
- [ ] Review third-party scripts

### Core Web Vitals

- [ ] LCP < 2.5s on all pages
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Run PageSpeed Insights on:
  - [ ] Homepage
  - [ ] 3 representative city pages
  - [ ] Calculator pages

### Conversion Optimization

- [ ] Implement A/B testing framework
- [ ] Create test variants:
  - [ ] CTA button text
  - [ ] Form length
  - [ ] Hero messaging
- [ ] Set up conversion tracking
- [ ] Lead scoring system
  - [ ] Score by business type
  - [ ] Score by purchase timeline
  - [ ] Score by location count

### Analytics

- [ ] Set up Netlify Analytics
- [ ] Configure Plausible (or GA4)
- [ ] Create conversion goals
- [ ] Set up Google Search Console
- [ ] Verify all pages indexed

---

## Testing Checklist

### Functional Testing

- [ ] Form submission works
- [ ] Notifications sent correctly
- [ ] All city pages load
- [ ] Internal links work
- [ ] Calculator returns data
- [ ] Mobile navigation works

### Cross-Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Accessibility Testing

- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast (4.5:1)
- [ ] Focus indicators visible
- [ ] Form labels associated
- [ ] Alt text on images

### Performance Testing

- [ ] Load time < 3 seconds
- [ ] First paint < 1.5 seconds
- [ ] Time to interactive < 3.5 seconds
- [ ] Test on slow 3G connection

---

## Launch Checklist

### Pre-Launch

- [ ] All pages reviewed for content
- [ ] Forms tested end-to-end
- [ ] Notifications working
- [ ] SSL certificate active
- [ ] Redirects configured
- [ ] 404 page designed
- [ ] Legal pages in place (Privacy, Terms)

### Launch Day

- [ ] Deploy to production
- [ ] Verify all pages accessible
- [ ] Submit sitemap to Google
- [ ] Test lead capture
- [ ] Monitor error logs
- [ ] Check analytics tracking

### Post-Launch

- [ ] Monitor for 404 errors
- [ ] Check search console for issues
- [ ] Review first leads
- [ ] Gather team feedback
- [ ] Plan first optimizations

---

## Environment Variables

Required for deployment:

```bash
# Supabase
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# External APIs
EIA_API_KEY=your_key
BLS_API_KEY=your_key
CENSUS_API_KEY=your_key

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
SENDGRID_API_KEY=SG...

# Optional
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

---

## Support Resources

- **Astro Docs**: https://docs.astro.build
- **Tailwind Docs**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Supabase Docs**: https://supabase.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **USDA API**: https://mpr.datamart.ams.usda.gov
- **EIA API**: https://www.eia.gov/opendata/
