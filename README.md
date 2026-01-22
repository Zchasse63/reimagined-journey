# Value Source - Food Service Distribution Platform

A modern web platform connecting food service businesses with distribution pricing intelligence, market data, and lead generation capabilities.

## Tech Stack

- **Framework:** Astro 4.x with React 18 components
- **Language:** TypeScript with strict type checking
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Netlify with SSR
- **Monorepo:** Turborepo

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reimagined-journey
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase credentials:
   - `PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
   - `SUPABASE_SECRET_KEY` - Your Supabase service role key

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:4321
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (includes type checking)
- `npm run preview` - Preview production build locally
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Lint source code with ESLint
- `npm test` - Run Playwright E2E tests

## Environment Variables

See `.env.example` for all available environment variables. Required variables:

- **Supabase** (Required)
  - `PUBLIC_SUPABASE_URL` - Supabase project URL
  - `PUBLIC_SUPABASE_ANON_KEY` - Public API key
  - `SUPABASE_SECRET_KEY` - Service role key for server-side operations

- **External APIs** (Optional for live data)
  - `EIA_API_KEY` - Energy Information Administration API
  - `FDA_API_KEY` - FDA recall data API
  - `BLS_API_KEY` - Bureau of Labor Statistics API
  - `CENSUS_API_KEY` - US Census data API

- **Notifications** (Optional)
  - `SLACK_WEBHOOK_URL` - Slack notifications
  - `SENDGRID_API_KEY` - Email notifications
  - `TWILIO_*` - SMS notifications

## Documentation

For detailed documentation, see the `/Docs` folder:

- **Architecture:** `/Docs/TECH_STACK.md`
- **Database:** `/Docs/DATABASE_SCHEMA.md`
- **API Reference:** `/Docs/API_REFERENCE.md`
- **Deployment:** `/Docs/DEPLOYMENT.md`

## Deployment

The application automatically deploys to Netlify when changes are pushed to the `main` branch.

- **Production URL:** Configured in Netlify dashboard
- **Preview Deploys:** Automatic for all pull requests
- **Build Command:** `npm run build`
- **Publish Directory:** `apps/web/dist`

### Pre-Deployment Checklist

1. Ensure all environment variables are set in Netlify
2. Run `npm run build` locally to verify build success
3. Run `npm run typecheck` to catch type errors
4. Run `npm test` to verify E2E tests pass

## Project Structure

```
reimagined-journey/
├── apps/
│   └── web/                 # Main Astro application
│       ├── src/
│       │   ├── components/  # React & Astro components
│       │   ├── layouts/     # Page layouts
│       │   ├── pages/       # Route pages & API endpoints
│       │   ├── lib/         # Utilities & API clients
│       │   └── types/       # TypeScript types
│       └── public/          # Static assets
├── packages/
│   └── data/                # Shared data & types
├── Docs/                    # Documentation
└── supabase/
    ├── functions/           # Edge functions
    └── migrations/          # Database migrations
```

## Features

- **156 City Landing Pages** - Automated SEO-optimized pages for major US cities
- **Lead Capture** - Multi-step form with validation and spam protection
- **Freight Calculator** - ZIP-to-ZIP freight cost estimates
- **Market Data** - Live commodity prices, diesel costs, freight rates
- **Historical Charts** - Trend analysis with interactive visualizations
- **Email Subscriptions** - Newsletter signup functionality
- **SSR Support** - Server-side rendering for fresh data on each request

## Contributing

See `CONTRIBUTING.md` for development guidelines and code standards.

## License

Proprietary - All rights reserved
